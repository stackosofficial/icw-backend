import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { initAdmin, Admin, AdminDocument } from '../DTO/admin';
import { getRandomString, reverse } from '../utils';
import { AES, enc } from 'crypto-js';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin.name) private adminModel: Model<AdminDocument>,
  ) {}

  async getAdmin() {
    let admin;
    try {
      admin = await this.adminModel.findOne();
      return admin;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  verifyLoginStatus(admin: Admin) {
    if (!admin.isLogged) {
      return false;
    }

    const curTime: Date = new Date();
    if (curTime > admin.loginEnd) {
      return false;
    }

    return true;
  }

  async generateToken(admin: Admin, force: boolean) {
    const nowTime = new Date();

    if (!admin) {
      admin = await this.getAdmin();
      if (!admin) {
        return null;
      }
    }

    let base = admin.baseToken;

    if (
      force ||
      !admin.baseToken ||
      (admin.baseToken && nowTime > admin.tokenTime)
    ) {
      base = getRandomString(32);
      try {
        const tokenTime = new Date();
        // const loginTime = new Date();
        // const loginEndTime = new Date(loginTime.getTime() + 1 * 60 * 60 * 1000);
        const newTokenTime = new Date(tokenTime.getTime() + 3 * 60 * 1000);
        await this.adminModel.updateOne(
          { username: admin.username },
          {
            baseToken: base,
            tokenTime: newTokenTime,
          },
        );
      } catch (err) {
        return null;
      }
    }

    const revBase = reverse(base);

    const token = AES.encrypt(revBase, admin.password).toString();

    return {
      base,
      token,
    };
  }

  validateToken(admin: Admin, recvToken: string) {
    const nowTime = new Date();
    if (!admin.baseToken || (admin.baseToken && nowTime > admin.tokenTime)) {
      return false;
    }

    const decryptVal = AES.decrypt(recvToken, admin.password).toString(
      enc.Utf8,
    );

    if (decryptVal != admin.baseToken) {
      return false;
    }

    return true;
  }

  async login(payload) {
    let loginDuration;
    if (!this.verifyPayload(payload)) {
      return {
        success: false,
        reason: 'Payload is not valid.',
      };
    }

    const recvToken = payload.auth.token;

    const admin = await this.getAdmin();
    if (!admin) {
      return {
        success: false,
        reason: 'Error occured: could not retrieve admin credentials.',
      };
    }

    if (!this.validateToken(admin, recvToken)) {
      return {
        success: false,
        reason: 'Token is invalid.',
      };
    }

    if (this.verifyLoginStatus(admin)) {
      return {
        success: false,
        isLogged: true,
        reason: 'Admin is already logged in.',
      };
    }

    const { token: newToken } = await this.generateToken(admin, true);

    try {
      const loginTime = new Date();
      loginDuration = 1 * 60 * 1000;
      const loginEndTime = new Date(loginTime.getTime() + loginDuration);

      await this.adminModel.updateOne(
        { username: admin.username },
        {
          isLogged: true,
          loginStart: loginTime,
          loginEnd: loginEndTime,
        },
      );
    } catch (err) {
      console.error(err);
      return {
        success: false,
        isLogged: false,
        reason: 'Failed to log in.',
      };
    }

    return {
      success: true,
      isLogged: true,
      loginEnd: loginDuration,
      auth: {
        token: newToken,
      },
    };
  }

  async logout(payload) {
    const admin = await this.getAdmin();
    if (!admin) {
      return {
        success: false,
        reason: 'Error occured: could not retrieve admin credentials.',
      };
    }

    const resp = await this.authorizeAdmin(payload, admin);
    if (!resp.success) {
      return resp;
    }

    return this.innerLogout(admin);
  }

  async innerLogout(admin: Admin) {
    try {
      await this.adminModel.updateOne(
        { username: admin.username },
        {
          isLogged: false,
        },
      );
    } catch (err) {
      console.error(err);
      return {
        success: false,
        reason: 'Failed to log out.',
      };
    }
    return {
      success: true,
    };
  }

  verifyPayload(payload) {
    if (!payload) {
      return false;
    }

    if (!payload.auth) {
      return false;
    }

    if (!payload.auth.token) {
      return false;
    }

    if (!payload.auth.token.length) {
      return false;
    }

    return true;
  }

  async authorizeAdmin(payload, admin) {
    if (!this.verifyPayload(payload)) {
      return {
        success: false,
        reason: 'Payload is not valid.',
      };
    }

    const recvToken = payload.auth.token;

    if (!admin) {
      admin = await this.getAdmin();
    }

    if (!admin) {
      return {
        success: false,
        reason: 'Error occured: could not retrieve admin credentials.',
      };
    }

    const newToken = await this.generateToken(admin, false);

    if (!this.validateToken(admin, recvToken)) {
      return {
        success: false,
        validateToken: false,
        reason: 'Token is not valid',
        auth: {
          token: newToken,
        },
      };
    }

    // if(!this.verifyLoginStatus(admin)) {
    //     return {
    //         success: false,
    //         isLogged: false,
    //         reason: 'Admin is not logged in.',
    //         auth: {
    //             token: newToken
    //         }
    //     }
    // }

    return {
      success: true,
      auth: {
        token: newToken,
      },
    };
  }

  async onModuleInit() {
    let admin = await this.getAdmin();
    if (!admin) {
      admin = initAdmin('admin', process.env.ADMIN_PASS);
      await new this.adminModel(admin).save();
    } else {
      await this.adminModel.updateOne(
        { username: 'admin' },
        { password: process.env.ADMIN_PASS },
      );
    }
  }
}
