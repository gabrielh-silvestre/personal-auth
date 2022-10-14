import { v4 as uuid } from 'uuid';

import { Mail } from './Mail';

describe('Unit test domain Mail entity', () => {
  it('should create a Mail entity', () => {
    const mail = new Mail(
      uuid(),
      'sender@email.com',
      'recipient@email.com',
      ['sender@email.com'],
      'Test email',
      'This is a test email',
      '<p>This is a test email</p>',
    );

    expect(mail.id).toBeDefined();
    expect(mail.from).toBe('sender@email.com');
    expect(mail.to).toBe('recipient@email.com');
    expect(mail.cc).toContain('sender@email.com');
    expect(mail.subject).toBe('Test email');
    expect(mail.text).toBe('This is a test email');
    expect(mail.html).toBe('<p>This is a test email</p>');
  });

  it('should throw an error if any email is invalid', () => {
    expect(() => {
      new Mail(
        uuid(),
        'from@com',
        'recipient@email.com',
        ['sender@email.com'],
        'Test email',
        'This is a test email',
        '<p>This is a test email</p>',
      );
    }).toThrowError('Sender must have a valid email address');

    expect(() => {
      new Mail(
        uuid(),
        'sender@email.com',
        'to.com',
        ['sender@email.com'],
        'Test email',
        'This is a test email',
        '<p>This is a test email</p>',
      );
    }).toThrowError('Recipient must have a valid email address');

    expect(() => {
      new Mail(
        uuid(),
        'sender@email.com',
        'recipient@email.com',
        ['from@.com'],
        'Test email',
        'This is a test email',
        '<p>This is a test email</p>',
      );
    }).toThrowError('All Cc recipients must have a valid email address');
  });

  it('should throw an error if any content field is empty', () => {
    expect(() => {
      new Mail(
        uuid(),
        'sender@email.com',
        'recipient@email.com',
        ['sender@email.com'],
        '',
        'This is a test email',
        '<p>This is a test email</p>',
      );
    }).toThrowError('Subject is required');

    expect(() => {
      new Mail(
        uuid(),
        'sender@email.com',
        'recipient@email.com',
        ['sender@email.com'],
        'Test email',
        '',
        '<p>This is a test email</p>',
      );
    }).toThrowError('Text is required');

    expect(() => {
      new Mail(
        uuid(),
        'sender@email.com',
        'recipient@email.com',
        ['sender@email.com'],
        'Test email',
        'This is a test email',
        '',
      );
    }).toThrowError('Html is required');
  });
});
