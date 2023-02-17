import { Get, Route } from "tsoa";

interface StatusResponse {
  active: boolean;
}

@Route("status")
export default class StatusController {
	@Get("/")
  public async getMessage(): Promise<StatusResponse> {
    return {
      active: true,
    };
  }
}