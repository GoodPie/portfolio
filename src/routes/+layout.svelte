<script>
	import { dev } from '$app/environment';
	import { inject } from '@vercel/analytics';
	import '../app.css';

	inject({ mode: dev ? 'development' : 'production' });
</script>

<main class="p-0 m-0">

	<div class="flex flex-col p-10 border-2 border-black bg-amber-100 h-dvh inset-2">

		<!-- Fake Window Header -->
		<div class="flex items-center justify-between min-h  border-black border-2 bg-orange-400 rounded-t-xl">

			<div class="flex flex-col w-full">
				<div class="flex items-center space-x-2 ps-4 py-4 w-full border-black border-b-2 ">
					<div class="w-3 border-black border-2 h-3 bg-red-500 rounded-full"></div>
					<div class="w-3 border-black border-2 h-3 bg-yellow-500 rounded-full"></div>
					<div class="w-3 border-black border-2 h-3 bg-green-500 rounded-full"></div>

					<div class="ps-2 text-2xl text-black vt323-regular ">
						BRANDYN'S PORTFOLIO
					</div>
				</div>

				<div class="bg-amber-50">
					<slot></slot>
				</div>
			</div>
		</div>
	</div>
</main>





