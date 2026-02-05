import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Tree from "./Tree";

const TreeScene = () => {
    return (
        <Canvas camera={{ position: [-15, 15, 15], fov: 50 }} style={{ borderRadius: "2rem", width: '100%', height: '100%' }}>
            <ambientLight intensity={0.8} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <Tree modelUrl="/willow_tree/willow_tree.gltf" />
            <OrbitControls enablePan enableZoom enableRotate />
        </Canvas>
    );
};

export default TreeScene;
