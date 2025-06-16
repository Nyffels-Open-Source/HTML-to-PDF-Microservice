import { Get, Route } from 'tsoa';

@Route('health')
export default class StatusController {
  @Get('/')
  public async getMessage(): Promise<string> {
    return "Ok";
  }
}
