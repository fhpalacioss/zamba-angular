
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders, HttpContext } from '@angular/common/http';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { environment } from '../../../environments/environment';
import { NgLocalization } from '@angular/common';
import { ALAIN_I18N_TOKEN, MenuService, SettingsService, TitleService } from '@delon/theme';
import { Observable, zip, catchError, map, finalize, throwError, of } from 'rxjs';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { NzIconService } from 'ng-zorro-antd/icon';
import { ACLService } from '@delon/acl';
import { Inject, Injectable } from '@angular/core';
import { ALLOW_ANONYMOUS } from '@delon/auth';
import { _HttpClient } from '@delon/theme';

import { ICONS } from '../../../style-icons';
import { ICONS_AUTO } from '../../../style-icons-auto';
import { I18NService } from '../../core/i18n/i18n.service';
import { SharedService } from './shared.service';
import { esEs } from '../../../assets/tmp/i18n/es-Es'
import { enUS } from '../../../assets/tmp/i18n/en-US'
import { DomSanitizer } from '@angular/platform-browser';



@Injectable({
    providedIn: 'root'
})
export class ZambaService {

    LOGIN_URL = environment['apiRestBasePath'];

    serverError = false;
    type = 0;
    loading = false;

    constructor(
        iconSrv: NzIconService,
        private menuService: MenuService,
        @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
        private settingService: SettingsService,
        private aclService: ACLService,
        private titleService: TitleService,
        private httpClient: HttpClient,
        private http: _HttpClient,
        private router: Router,
        public sharedService: SharedService,
        @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
        private sanitizer: DomSanitizer

    ) {
        iconSrv.addIcon(...ICONS_AUTO, ...ICONS);
    }

    public getThumbsPathHome(data: any) {
        data = JSON.stringify(data);
        var url = this.LOGIN_URL + "search/GetThumbsPathHome";
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.httpClient.post(url, data, httpOptions);
    }

    public GetUserInfoForName(data: any) {
        var url = this.LOGIN_URL + "search/GetUserInfoForName?UserName=" + data;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
        return this.httpClient.post(url, httpOptions);
    }

    public GetConfigUserSidbar() {

        const tokenData = this.tokenService.get();
        let genericRequest = {}
        let groupsid: any[] = []


        if (tokenData != null) {
            tokenData["groups"].forEach(function (values: any) {
                groupsid.push(values["ID"])
            })

            genericRequest = {
                UserId: tokenData["userid"],
                Params: {
                    "groups": groupsid.toString()
                }
            };
        }
        //TODO: este codigo carga la visualizacion de la sidbar pensar mas adelante en ponerlo asyncronico
        //actualmente no funciona de esa manera ya que recarga 2 veces la  interfaz
        const xhr = new XMLHttpRequest();
        xhr.open('POST', this.LOGIN_URL + '/configUserSidbar', false);  // El tercer parámetro indica si la solicitud es síncrona
        xhr.setRequestHeader('Content-Type', 'application/json');

        try {
            xhr.send(JSON.stringify(genericRequest));
            if (xhr.status === 200) {
                const deserealize = JSON.parse(xhr.responseText);
                let response = JSON.parse(deserealize);

                if (response.length == 0)
                    return false

                let valueToAnalize = parseInt(response[0].value)

                if (valueToAnalize == 0)
                    return true
                else
                    return false


            } else {
                // Manejar errores aquí
                console.error('Error en la solicitud POST:', xhr.statusText);
                return false;
            }
        } catch (error) {
            // Manejar errores aquí
            console.error('Error en la solicitud POST:', error);
            return false;
        }


    }



    public GetinfoSideBar() {
        const tokenData = this.tokenService.get();
        let genericRequest = {}
        let groupsid: any[] = []
        if (tokenData != null) {
            if (tokenData["groups"] != null) {
                tokenData["groups"].forEach(function (values: any) {
                    groupsid.push(values["ID"])
                })

                genericRequest = {
                    UserId: tokenData["userid"],
                    Params: {
                        "groups": groupsid.toString()
                    }
                };
            }
        }

        this.http
            .post(
                `${environment['apiRestBasePath']}/getinfoSideBar`,
                genericRequest,
                null,
                {
                    context: new HttpContext().set(ALLOW_ANONYMOUS, true)
                }
            ).pipe(
                catchError(res => {
                    console.warn(`StartupService.load: Network request failed`, res);
                    setTimeout(() => this.router.navigateByUrl(`/exception/500`));
                    return of(null);
                }),
                map((appData: NzSafeAny) => {
                    appData = JSON.parse(appData);
                    if (appData) {
                        this.settingService.setApp(appData.app);
                        this.settingService.setUser(appData.user);
                        this.aclService.setFull(true);
                        this.menuService.add(appData.menu.items);
                        this.titleService.default = '';
                        this.titleService.suffix = appData.app.name;
                    }
                })
            ).subscribe();
    }

    executeRule(genericRequest: any): Observable<any> {
        // Aquí realizas la lógica de tu llamada HTTP
        return this.http
            .post(
                `${environment.apiRestBasePath}/executeRuleDashboard`,
                genericRequest,
                null,
                {
                    context: new HttpContext().set(ALLOW_ANONYMOUS, true)
                }
            )
        //return this.http.post(this.LOGIN_URL + '/executeRuleDashboard', genericRequest);
    }

}
