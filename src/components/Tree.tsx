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

    useFrame((state) => {
        if (!ref.current) return;

        const t = state.clock.getElapsedTime();
        ref.current.rotation.set(Math.cos(t / 4) / 8, Math.sin(t / 3) / 4, 0.15 + Math.sin(t / 2) / 8);
        ref.current.position.y = (0.5 + Math.cos(t / 2)) / 7;
    });

    return (
        <group ref={ref} {...props}>
            <primitive object={gltf.scene} />
        </group>
    );
}

export default Tree;