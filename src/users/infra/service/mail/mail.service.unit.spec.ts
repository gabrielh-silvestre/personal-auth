import type { IMailGateway } from '@users/infra/gateway/mail/Mail.gateway.interface';
import type { IMailService } from './mail.service.interface';

import { MailService } from './Mail.service';

import { USERS_MOCK } from '@shared/utils/mocks/users.mock';

const [{ email, username }] = USERS_MOCK;

describe('Unit test for Mail service', () => {
  let mailService: IMailService;
  const mailGateway: IMailGateway = {
    send: jest.fn(),
  };

  beforeEach(() => {
    mailService = new MailService(mailGateway);
  });

  it('should send a welcome mail', async () => {
    await mailService.welcomeMail({ email, username });

    expect(mailGateway.send).toBeCalledWith(email, expect.any(String), {
      text: expect.stringContaining(username),
      html: expect.stringContaining(username),
    });
  });
});
