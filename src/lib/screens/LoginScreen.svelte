<script>
	import { toast } from '@zerodevx/svelte-toast';

	export let onSubmit;

	let identityNumber = '';
	let loading = false;

	async function handleSubmit() {
		loading = true;
		try {
			await onSubmit(identityNumber);
		} catch (error) {
			toast.push('Error al iniciar sesión. Por favor, verifique su número de identidad. Si el error persiste, contáctenos.', {
				duration: 8000,
				theme: {
					'--toastBackground': '#f56565',
					'--toastBarBackground': '#c53030'
				}
			});
		}
		loading = false;
	}
</script>

<div class="container">
	<!-- Icono desde la carpeta img -->
	<img src="logo_512.png" alt="Icono" class="icon" />

	<form on:submit|preventDefault={handleSubmit}>
		<!-- Campo de entrada para el número de identidad -->
		<input
			type="text"
			class="input-field"
			placeholder="Ingrese su número de identidad"
			bind:value={identityNumber}
			required
		/>

		<!-- Botón de ingresar -->
		<button class="submit-button" disabled={loading}>Ingresar</button>

		{#if loading}
		<dialog open>
			Cargando...
		</dialog>
		{/if}
	</form>
</div>

<style>
	/* Estilos opcionales para el componente */
	.container {
		display: flex;
		flex-direction: column; /* Organiza los elementos en columna */
		justify-content: center; /* Centra verticalmente los elementos */
		align-items: center; /* Centra horizontalmente los elementos */
		height: 100vh; /* Ocupa toda la altura de la pantalla visible */
		padding: 0 20px; /* Padding horizontal de 20px */
		gap: 10px;
		margin-bottom: 20px;
	}

	.input-field {
		width: 100%; /* Ocupa todo el ancho disponible */
		padding: 8px;
		font-size: 16px;
		border: 1px solid #ccc;
		border-radius: 4px;
		box-sizing: border-box; /* Asegura que el padding no afecte el ancho total */
	}

	.submit-button {
		width: 100%; /* Ocupa todo el ancho disponible */
		padding: 10px 20px;
		font-size: 16px;
		background-color: #007bff;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}

	/* Estilo para la imagen del icono */
	.icon {
		width: 50%; /* Ajusta el tamaño de la imagen según sea necesario */
		height: auto; /* Altura automática para mantener la proporción */
		margin-bottom: 10px; /* Espacio entre el icono y el campo de entrada */
	}
</style>
