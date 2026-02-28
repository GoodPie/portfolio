import {useFrame} from "@react-three/fiber";
import {useRef} from "react";
import {useGLTF} from "@react-three/drei";
import type * as THREE from "three";

interface TreeProps {
    modelUrl: string;
}

const Tree = ({ modelUrl, ...props }: TreeProps) => {
    const ref = useRef<THREE.Group>(null);
    const gltf = useGLTF(modelUrl) as any;

    // Animation constants
    const BASE_Y_POSITION = -10;
    const INITIAL_Y_POSITION = -2;
    const ROTATION_AMPLITUDE = {
        x: 1 / 8,
        y: 1 / 4,
        z: 1 / 8,
    };
    const ROTATION_SPEED = {
        x: 1 / 4,
        y: 1 / 3,
        z: 1 / 2,
    };
    const BOB_AMPLITUDE = 1 / 7;
    const BOB_SPEED = 1 / 2;
    const Z_ROTATION_OFFSET = 0.15;

    useFrame((state) => {
        if (!ref.current) return;

        const t = state.clock.getElapsedTime();

        // Gentle rotation oscillation
        ref.current.rotation.set(
            Math.cos(t * ROTATION_SPEED.x) * ROTATION_AMPLITUDE.x,
            Math.sin(t * ROTATION_SPEED.y) * ROTATION_AMPLITUDE.y,
            Z_ROTATION_OFFSET + Math.sin(t * ROTATION_SPEED.z) * ROTATION_AMPLITUDE.z
        );

        // Subtle bobbing motion
        const bobOffset = (0.5 + Math.cos(t * BOB_SPEED)) * BOB_AMPLITUDE;
        ref.current.position.y = BASE_Y_POSITION + bobOffset;
    });

    return (
        <group ref={ref} {...props} position={[0, INITIAL_Y_POSITION, 0]}>
            <primitive object={gltf.scene} />
        </group>
    );
}

export default Tree;