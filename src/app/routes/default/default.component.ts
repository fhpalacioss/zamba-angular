import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { _HttpClient } from '@delon/theme';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-account-settings-default',
  templateUrl: './default.component.html',
  styleUrls: ['default.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DefaultComponent implements OnInit {
  constructor(public msg: NzMessageService, @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,) {

  }
  ngOnInit(): void {
    const tokenData = this.tokenService.get();
    if (tokenData != null)
      console.log("Imprimo los valores en tokenService", tokenData);
  }
}
