import os
import trimesh
import logging

logger = logging.getLogger(__name__)


def convert_obj_to_glb(obj_path: str) -> str:
    """
    Converts an OBJ file (with its MTL and textures) to a GLB file.

    Expects the .mtl and texture files to be in the same directory
    as the .obj file, which is the standard output structure.

    Args:
        obj_path: Absolute path to the .obj file on disk.

    Returns:
        Absolute path to the generated .glb file.

    Raises:
        FileNotFoundError: If the OBJ file does not exist.
        RuntimeError: If the conversion fails.
    """
    if not os.path.exists(obj_path):
        raise FileNotFoundError(f"OBJ file not found: {obj_path}")

    glb_path = os.path.splitext(obj_path)[0] + ".glb"

    try:
        # Load the OBJ — trimesh automatically resolves the MTL
        # and textures from the same directory
        scene = trimesh.load(
            obj_path,
            force="scene",  # always load as a Scene (even single mesh)
            process=False,  # skip mesh processing to preserve original data
        )

        if scene is None:
            raise RuntimeError(
                "trimesh returned None — OBJ file may be empty or malformed."
            )

        # Export to GLB (binary GLTF — single self-contained file)
        glb_bytes = scene.export(file_type="glb")

        with open(glb_path, "wb") as f:
            f.write(glb_bytes)

        logger.info(f"Converted {obj_path} -> {glb_path} ({len(glb_bytes)} bytes)")
        return glb_path

    except Exception as e:
        logger.exception(f"OBJ to GLB conversion failed for {obj_path}: {e}")
        raise RuntimeError(f"Conversion failed: {e}") from e


def cleanup_obj_files(obj_path: str) -> None:
    """
    Optionally deletes the original OBJ, MTL, and texture files
    after a successful conversion to save disk space.

    Args:
        obj_path: Absolute path to the .obj file.
    """
    obj_dir = os.path.dirname(obj_path)
    obj_name = os.path.splitext(os.path.basename(obj_path))[0]

    # Extensions to clean up
    extensions = [".obj", ".mtl"]
    texture_extensions = [".png", ".jpg", ".jpeg"]

    for ext in extensions:
        target = os.path.join(obj_dir, obj_name + ext)
        if os.path.exists(target):
            os.remove(target)
            logger.info(f"Deleted: {target}")

    # Clean up any texture files in the same directory
    for filename in os.listdir(obj_dir):
        if any(filename.lower().endswith(ext) for ext in texture_extensions):
            texture_path = os.path.join(obj_dir, filename)
            os.remove(texture_path)
            logger.info(f"Deleted texture: {texture_path}")
