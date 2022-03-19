
import { Manager } from '../core';
import { PKG, SDKManager, Command as SDKCommand } from '../cmd/SDKManager';
import { Service } from './Service';
import * as util from '../util';
import { MsgType, showMsg, term, sendTerm } from '../ext_util';

export class SDKService extends Service {
    private sdkmanager: SDKManager;
    constructor(manager: Manager) {
        super(manager);
        this.sdkmanager = new SDKManager(manager);
    }

    async getPkgs(noCache: boolean = false): Promise<PKG[] | undefined> {
        let out = this.getCache("getPkgs");
        if (!out || noCache) {
            out = this.sdkmanager.exec<PKG>(SDKCommand.listPkg);
            this.setCache("getPkgs", out);
        }
        return out;
    }

    async getInstalledPkgs(noCache: boolean = false): Promise<PKG[] | undefined> {
        let out = this.getCache("getInstalledPkgs");
        if (!out || noCache) {
            out = this.sdkmanager.exec<PKG>(SDKCommand.listInstalled);
            this.setCache("getInstalledPkgs", out);
        }
        return out;
    }



    async installPKG(pkgname: string, displayName: string) {
        return this.sdkmanager.exec<string>(SDKCommand.installPkg, pkgname, displayName);
    }

    async uninstallPkg(pkgname: string, displayName: string) {
        return this.sdkmanager.exec<string>(SDKCommand.uninstallPkg, pkgname, displayName);
    }

    async getSDKList(noCache: boolean = false): Promise<{ [key: string]: PKG } | undefined> {
        let out = this.getCache("getSDKList");
        if (!out || noCache) {
            out = await Promise.all([this.getPkgs(noCache), this.getInstalledPkgs(noCache)]).then(data => {
                let [pkgs, installed] = data;

                let pkgsKeyed = util.keyBy(pkgs ?? [], "pathRaw");
                let installedKeyed = util.keyBy(installed ?? [], "pathRaw");

                for (const installedkey in installedKeyed) {
                    pkgsKeyed[installedkey] = installedKeyed[installedkey];
                }
                return pkgsKeyed;
            });

            this.setCache("getSDKList", out);
        }
        return out;
    }



    async acceptLicnese(sdkbin: string) {
        let command = "echo y | {{exe}} --licenses";
        let cmd = util.strformatNamed(command, { "exe": sdkbin });

        let t = term("Accept SDK licenses", cmd);

        let msg = "\n-------------------------------------\n\n";
        msg += "All Licenses should be accepted. '";
        msg += "\n";
        msg += "Please close this terminal. '";
        msg += "\n\n-------------------------------------\n";

        return sendTerm(t, "y", "y", "y", "y", "y", "y", "y", "y", "y", "y", `echo "${msg}"`)
            .then(() => {
                showMsg(MsgType.info, "All Licenses should be accepted.");
            });

    };


    async updateAllPkg() {
        return this.sdkmanager.exec<string>(SDKCommand.updateAllPkg);
    }


}