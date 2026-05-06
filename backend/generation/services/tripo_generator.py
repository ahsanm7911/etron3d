import asyncio

from tripo3d import TripoClient, TaskStatus
import os
from dotenv import load_dotenv
from pathlib import Path

load_dotenv()

key = os.getenv("TRIPO_API_KEY")


async def image_to_model_example(image: str | Path, output_path: str | Path):
    print("Calling tripo generator service.")
    print(f"IMAGE Inside service: {str(image)[:1000]}...")
    output_path = Path(output_path)

    async with TripoClient() as client:
        try:
            # 1. Create task
            task_id = await client.image_to_model(image=image)
            print(f"Task ID: {task_id}")

            # 2. Wait for completion
            task = await client.wait_for_task(task_id, verbose=True)
            print(f"TASK RESPONSE: {task}")

            if task.status != TaskStatus.SUCCESS:
                print(f"Task failed with status: {task.status}")
                return None, None

            # 3. Prepare output folder
            model_output_dir = output_path / task_id
            model_output_dir.mkdir(parents=True, exist_ok=True)

            # 4. Download models
            downloaded_files = await client.download_task_models(
                task, str(model_output_dir)
            )

            model_path = downloaded_files.get("pbr_model")  # or "model" / "glb" etc.

            if not model_path:
                print("No pbr_model found in downloaded files")
                return task_id, None

            print(f"Successfully downloaded model: {model_path}")
            return task_id, model_path

        except Exception as e:
            print(f"Tripo Generation Error: {e}")
            import traceback

            traceback.print_exc()
            return None, None  # or raise, depending on what you want


async def get_model_files(task_id, output_folder):
    async with TripoClient() as client:
        task = await client.get_task(task_id)

        download_files = await client.download_task_models(task, output_folder)

        for model_type, file_path in download_files.items():
            if file_path:
                print(f"Downloaded {model_type}: {file_path}")

        model_path = download_files["pbr_model"]
        return model_path


async def get_image_token(image):
    async with TripoClient() as client:
        file_token = await client.upload_file(image)
        return file_token["file_token"]


async def main():
    async with TripoClient(api_key=key) as client:
        task_id = await client.text_to_model(
            prompt="a small cat",
            negative_prompt="low quality, blurry",
        )
        print(f"Task ID: {task_id}")

        task = await client.wait_for_task(task_id, verbose=True)
        if task.status == TaskStatus.SUCCESS:
            files = await client.download_task_models(task, "./output")
            for model_type, path in files.items():
                print(f"Downloaded {model_type}: {path}")


if __name__ == "__main__":
    # img = "sample.jpg"
    # data = upload_image(img)
    # print(data)
    # data = generate_model_by_image()
    # print(data)
    asyncio.run(image_to_model_example())
