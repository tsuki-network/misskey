<template>
<div>
	<div class="_section">
		<div class="_content">
			<MkInput v-model:value="host" :debounce="true"><span>{{ $ts.host }}</span></MkInput>
			<div class="inputs" style="display: flex;">
				<MkSelect v-model:value="state" style="margin: 0; flex: 1;">
					<template #label>{{ $ts.state }}</template>
					<option value="all">{{ $ts.all }}</option>
					<option value="federating">{{ $ts.federating }}</option>
					<option value="subscribing">{{ $ts.subscribing }}</option>
					<option value="publishing">{{ $ts.publishing }}</option>
					<option value="suspended">{{ $ts.suspended }}</option>
					<option value="blocked">{{ $ts.blocked }}</option>
					<option value="notResponding">{{ $ts.notResponding }}</option>
				</MkSelect>
				<MkSelect v-model:value="sort" style="margin: 0; flex: 1;">
					<template #label>{{ $ts.sort }}</template>
					<option value="+pubSub">{{ $ts.pubSub }} ({{ $ts.descendingOrder }})</option>
					<option value="-pubSub">{{ $ts.pubSub }} ({{ $ts.ascendingOrder }})</option>
					<option value="+notes">{{ $ts.notes }} ({{ $ts.descendingOrder }})</option>
					<option value="-notes">{{ $ts.notes }} ({{ $ts.ascendingOrder }})</option>
					<option value="+users">{{ $ts.users }} ({{ $ts.descendingOrder }})</option>
					<option value="-users">{{ $ts.users }} ({{ $ts.ascendingOrder }})</option>
					<option value="+following">{{ $ts.following }} ({{ $ts.descendingOrder }})</option>
					<option value="-following">{{ $ts.following }} ({{ $ts.ascendingOrder }})</option>
					<option value="+followers">{{ $ts.followers }} ({{ $ts.descendingOrder }})</option>
					<option value="-followers">{{ $ts.followers }} ({{ $ts.ascendingOrder }})</option>
					<option value="+caughtAt">{{ $ts.caughtAt }} ({{ $ts.descendingOrder }})</option>
					<option value="-caughtAt">{{ $ts.caughtAt }} ({{ $ts.ascendingOrder }})</option>
					<option value="+lastCommunicatedAt">{{ $ts.lastCommunicatedAt }} ({{ $ts.descendingOrder }})</option>
					<option value="-lastCommunicatedAt">{{ $ts.lastCommunicatedAt }} ({{ $ts.ascendingOrder }})</option>
					<option value="+driveUsage">{{ $ts.driveUsage }} ({{ $ts.descendingOrder }})</option>
					<option value="-driveUsage">{{ $ts.driveUsage }} ({{ $ts.ascendingOrder }})</option>
					<option value="+driveFiles">{{ $ts.driveFiles }} ({{ $ts.descendingOrder }})</option>
					<option value="-driveFiles">{{ $ts.driveFiles }} ({{ $ts.ascendingOrder }})</option>
				</MkSelect>
			</div>
		</div>
	</div>
	<div class="_section">
		<div class="_content">
			<MkPagination :pagination="pagination" #default="{items}" ref="instances" :key="host + state">
				<div class="ppgwaixt _panel" v-for="instance in items" :key="instance.id" @click="info(instance)">
					<div class="host"><Fa :icon="faCircle" class="indicator" :class="getStatus(instance)"/><b>{{ instance.host }}</b></div>
					<div class="status">
						<span class="sub" v-if="instance.followersCount > 0"><Fa :icon="faCaretDown" class="icon"/>Sub</span>
						<span class="sub" v-else><Fa :icon="faCaretDown" class="icon"/>-</span>
						<span class="pub" v-if="instance.followingCount > 0"><Fa :icon="faCaretUp" class="icon"/>Pub</span>
						<span class="pub" v-else><Fa :icon="faCaretUp" class="icon"/>-</span>
						<span class="lastCommunicatedAt"><Fa :icon="faExchangeAlt" class="icon"/><MkTime :time="instance.lastCommunicatedAt"/></span>
						<span class="latestStatus"><Fa :icon="faTrafficLight" class="icon"/>{{ instance.latestStatus || '-' }}</span>
					</div>
				</div>
			</MkPagination>
		</div>
	</div>
</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { faGlobe, faCircle, faExchangeAlt, faCaretDown, faCaretUp, faTrafficLight } from '@fortawesome/free-solid-svg-icons';
import MkButton from '@/components/ui/button.vue';
import MkInput from '@/components/ui/input.vue';
import MkSelect from '@/components/ui/select.vue';
import MkPagination from '@/components/ui/pagination.vue';
import MkInstanceInfo from './instance.vue';
import * as os from '@/os';

export default defineComponent({
	components: {
		MkButton,
		MkInput,
		MkSelect,
		MkPagination,
	},

	data() {
		return {
			INFO: {
				title: this.$ts.federation,
				icon: faGlobe
			},
			host: '',
			state: 'federating',
			sort: '+pubSub',
			pagination: {
				endpoint: 'federation/instances',
				limit: 10,
				offsetMode: true,
				params: () => ({
					sort: this.sort,
					host: this.host != '' ? this.host : null,
					...(
						this.state === 'federating' ? { federating: true } :
						this.state === 'subscribing' ? { subscribing: true } :
						this.state === 'publishing' ? { publishing: true } :
						this.state === 'suspended' ? { suspended: true } :
						this.state === 'blocked' ? { blocked: true } :
						this.state === 'notResponding' ? { notResponding: true } :
						{})
				})
			},
			faGlobe, faCircle, faExchangeAlt, faCaretDown, faCaretUp, faTrafficLight
		}
	},

	watch: {
		host() {
			this.$refs.instances.reload();
		},
		state() {
			this.$refs.instances.reload();
		}
	},

	methods: {
		getStatus(instance) {
			if (instance.isSuspended) return 'off';
			if (instance.isNotResponding) return 'red';
			return 'green';
		},

		info(instance) {
			os.popup(MkInstanceInfo, {
				instance: instance
			}, {}, 'closed');
		}
	}
});
</script>

<style lang="scss" scoped>
.ppgwaixt {
	cursor: pointer;
	padding: 16px;

	&:hover {
		color: var(--accent);
	}

	> .host {
		> .indicator {
			font-size: 70%;
			vertical-align: baseline;
			margin-right: 4px;

			&.green {
				color: #49c5ba;
			}

			&.yellow {
				color: #c5a549;
			}

			&.red {
				color: #c54949;
			}

			&.off {
				color: rgba(0, 0, 0, 0.5);
			}
		}
	}

	> .status {
		display: flex;
		align-items: center;
		font-size: 90%;

		> span {
			flex: 1;
			
			> .icon {
				margin-right: 6px;
			}
		}
	}
}
</style>
