import { User, isLocalUser, isRemoteUser } from '../../../models/user';
import Note, { Note } from '../../../models/note';
import NoteReaction from '../../../models/note-reaction';
import { publishNoteStream } from '../../stream';
import renderLike from '../../../remote/activitypub/renderer/like';
import renderUndo from '../../../remote/activitypub/renderer/undo';
import { renderActivity } from '../../../remote/activitypub/renderer';
import { deliver } from '../../../queue';
import { IdentifiableError } from '../../../misc/identifiable-error';

export default async (user: User, note: Note) => {
	// if already unreacted
	const exist = await NoteReaction.findOne({
		noteId: note.id,
		userId: user.id,
		deletedAt: { $exists: false }
	});

	if (exist === null) {
		throw new IdentifiableError('60527ec9-b4cb-4a88-a6bd-32d3ad26817d', 'not reacted');
	}

	// Delete reaction
	await NoteReaction.remove({
		id: exist.id
	});

	const dec: any = {};
	dec[`reactionCounts.${exist.reaction}`] = -1;

	// Decrement reactions count
	Note.update({ _id: note.id }, {
		$inc: dec
	});

	publishNoteStream(note.id, 'unreacted', {
		reaction: exist.reaction,
		userId: user.id
	});

	//#region 配信
	// リアクターがローカルユーザーかつリアクション対象がリモートユーザーの投稿なら配送
	if (isLocalUser(user) && isRemoteUser(note._user)) {
		const content = renderActivity(renderUndo(renderLike(user, note, exist.reaction), user));
		deliver(user, content, note._user.inbox);
	}
	//#endregion

	return;
};
