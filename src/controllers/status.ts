import { Get, Route, Security } from 'tsoa';

interface StatusResponse {
  active: boolean;
}

@Route('status')
export default class StatusController {
	@Security("authorization")
  @Get('/')
  public async getMessage(): Promise<StatusResponse> {
    return {
      active: true,
    };
  }
}
