import React from 'react';
import { useStore } from '../store';
import type { DoughLoop } from '../store';

const demoLoops: DoughLoop[] = [
	{
		id: -1, // Use negative IDs to avoid collisions with real user loop IDs
		userId: -1,
		name: 'Boom Bap',
		beatRep:
			'90,2,4::kick1:1|clap1:1|snare1:1|hat1:1|rim1:1|tom1:1|cymbal1:1|triangle1:1::10001000::00000000::00100010::11111111::00000000::00000000::00000000::00000000',
	},
	{
		id: -2,
		userId: -1,
		name: 'Four on the Floor',
		beatRep:
			'120,2,4::kick1:1|clap1:1|snare1:1|hat1:1|rim1:1|tom1:1|cymbal1:1|triangle1:1::10001000::00000000::00000000::01010101::00000000::00000000::00000000::00000000',
	},
];

export default function DemoLoopList() {
	const selectedLoop = useStore((s) => s.selectedLoop);
	const setSelectedLoop = useStore((s) => s.setSelectedLoop);

	return (
		<div>
			<h3>Demo Loops</h3>
			<ul>
				{demoLoops.map((loop) => (
					<li
						key={loop.id}
						style={{
							cursor: 'pointer',
							fontWeight: selectedLoop?.id === loop.id ? 'bold' : 'normal',
						}}
						onClick={() => {
							setSelectedLoop(loop); // triggers decode automatically
						}}
					>
						{loop.name}
					</li>
				))}
			</ul>
		</div>
	);
}
