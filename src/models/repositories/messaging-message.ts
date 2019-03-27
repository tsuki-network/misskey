import { EntityRepository, Repository } from 'typeorm';
import { MessagingMessage } from '../entities/messaging-message';
import { Users, DriveFiles } from '..';

@EntityRepository(MessagingMessage)
export class MessagingMessageRepository extends Repository<MessagingMessage> {
	private async cloneOrFetch(x: MessagingMessage['id'] | MessagingMessage): Promise<MessagingMessage> {
		if (typeof x === 'object') {
			return JSON.parse(JSON.stringify(x));
		} else {
			return await this.findOne(x);
		}
	}

	public isValidText(text: string): boolean {
		return text.trim().length <= 1000 && text.trim() != '';
	}

	public async pack(
		message: any,
		me?: any,
		options?: {
			populateRecipient: boolean
		}
	) {
		const opts = options || {
			populateRecipient: true
		};

		const _message = await this.cloneOrFetch(message);

		return {
			id: _message.id,
			createdAt: _message.createdAt,
			text: _message.text,
			user: await Users.pack(_message.user || _message.userId, me),
			recipient: opts.populateRecipient ? await Users.pack(_message.recipient || _message.recipientId, me) : null,
			file: _message.fileId ? await DriveFiles.pack(_message.fileId) : null,
		};
	}
}
