import os
import zipfile
import sys

def make_final_zip():
    dist_dir = os.path.abspath("dist")
    output_zip = os.path.abspath("MusicMarshall_Complete_Deployment.zip")
    
    if not os.path.exists(dist_dir):
        print(f"Error: {dist_dir} does not exist!")
        sys.exit(1)
        
    print(f"Creating complete deployment ZIP: {output_zip}")
    print(f"Sourcing from: {dist_dir}")
    
    file_count = 0
    total_uncompressed_bytes = 0
    
    with zipfile.ZipFile(output_zip, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as zf:
        for root, dirs, files in os.walk(dist_dir):
            for file in files:
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, dist_dir)
                size = os.path.getsize(full_path)
                zf.write(full_path, rel_path)
                file_count += 1
                total_uncompressed_bytes += size
                print(f"  Added: {rel_path} ({size:,} bytes)")
                
    zip_size = os.path.getsize(output_zip)
    print("\n--- Summary ---")
    print(f"Total files packed: {file_count}")
    print(f"Total uncompressed size: {total_uncompressed_bytes / (1024*1024):.2f} MB")
    print(f"Final ZIP archive size: {zip_size / (1024*1024):.2f} MB")
    print(f"Created successfully: {output_zip}")

if __name__ == "__main__":
    make_final_zip()
