import * as deepcopy from 'deepcopy';
import { pack as packUser, User } from './user';
import { PrimaryGeneratedColumn, Entity, Index, JoinColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user';

@Entity()
@Index(['muterId', 'muteeId'], { unique: true })
export class Muting {
	@PrimaryGeneratedColumn()
	public id: number;

	@Index()
	@Column('date', {
		comment: 'The created date of the Muting.'
	})
	public createdAt: Date;

	@Index()
	@Column('varchar', {
		length: 24,
		comment: 'The mutee user ID.'
	})
	public muteeId: string;

	@ManyToOne(type => User, {
		onDelete: 'CASCADE'
	})
	@JoinColumn()
	public mutee: User | null;

	@Index()
	@Column('varchar', {
		length: 24,
		comment: 'The muter user ID.'
	})
	public muterId: string;

	@ManyToOne(type => User, {
		onDelete: 'CASCADE'
	})
	@JoinColumn()
	public muter: User | null;
}

export const packMany = (
	mutes: (string | mongo.ObjectID | IMute)[],
	me?: string | mongo.ObjectID | User
) => {
	return Promise.all(mutes.map(x => pack(x, me)));
};

export const pack = (
	mute: any,
	me?: any
) => new Promise<any>(async (resolve, reject) => {
	let _mute: any;

	// Populate the mute if 'mute' is ID
	if (isObjectId(mute)) {
		_mute = await Mute.findOne({
			id: mute
		});
	} else if (typeof mute === 'string') {
		_mute = await Mute.findOne({
			id: new mongo.ObjectID(mute)
		});
	} else {
		_mute = deepcopy(mute);
	}

	// Rename _id to id
	_mute.id = _mute.id;
	delete _mute.id;

	// Populate mutee
	_mute.mutee = await packUser(_mute.muteeId, me, {
		detail: true
	});

	resolve(_mute);
});
