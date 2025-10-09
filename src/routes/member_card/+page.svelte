<script>
	import MemberCardScreen from '$lib/screens/MemberCardScreen.svelte';
	import { onMount, onDestroy, getContext } from 'svelte';
	import { AthleteNotFoundError } from "$lib/actions/GetAthlete";

	const provider = getContext('provider');
	const redirect = getContext('redirect');
	const athlete = getContext('athlete');
	const lastSync = getContext('lastSync');
	const token = getContext('token');

	const onLogOut = () => {
		$athlete = null;
		$lastSync = null;
	};

	function addHours(date, hours) {
		console.log(date)
		const hoursToAdd = hours * 60 * 60 * 1000;
		date.setTime(date.getTime() + hoursToAdd);
		console.log(date)
		return date;
	}

	onMount(async () => {
		let now = new Date();
		console.log(now)
		if ($athlete) {
			try {
				$athlete = await provider.getAthlete.handle($athlete.identification);
				if ($token && $athlete.token !== $token) {
					$athlete.token = $token;
					await provider.saveToken.handle($athlete);
				}
				$lastSync = new Date();
			} catch (error) {
				if (error instanceof AthleteNotFoundError) {
					$athlete = null;
					$lastSync = null;
					redirect('/');
					return;
				}
				console.log(error);
			}
			try {
				let information = await provider.getInformation.handle($athlete.id);
				$athlete.total_distance = information.total_distance;
			} catch (error) {
				console.log(error);
			}
		}
	});

	$: {
		if (!$athlete) {
			redirect('/');
		}
	}
</script>

<MemberCardScreen bind:athlete={$athlete} {onLogOut} />
