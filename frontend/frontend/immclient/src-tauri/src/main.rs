#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

#[tauri::command]
fn install_chromium(handle: tauri::AppHandle, target_path: &str) -> String {
    let chromium_archive = handle
        .path_resolver()
        .resolve_resource("external-bin/ms-playwright-win.zip")
        .expect("failed to resolve resource");
    let file = std::fs::File::open(chromium_archive).unwrap();
    let mut archive = zip::ZipArchive::new(file).unwrap();

    for i in 0..archive.len() {
        let mut file = archive.by_index(i).unwrap();
        let outpath = match file.enclosed_name() {
            Some(path) => path.to_owned(),
            None => continue,
        };
        let outpath = std::path::Path::new(target_path).join(outpath);

        {
            let comment = file.comment();
            if !comment.is_empty() {
                println!("File {i} comment: {comment}");
            }
        }

        if (*file.name()).ends_with('/') {
            println!("File {} extracted to \"{}\"", i, outpath.display());
            std::fs::create_dir_all(&outpath).unwrap();
        } else {
            println!(
                "File {} extracted to \"{}\" ({} bytes)",
                i,
                outpath.display(),
                file.size()
            );
            if let Some(p) = outpath.parent() {
                if !p.exists() {
                    std::fs::create_dir_all(p).unwrap();
                }
            }
            let mut outfile = std::fs::File::create(&outpath).unwrap();
            std::io::copy(&mut file, &mut outfile).unwrap();
        }

        // Get and Set permissions
        /* FIXME: causes Mac build error
        #[cfg(unix)]
        {
            use std::os::unix::fs::PermissionsExt;

            if let Some(mode) = file.unix_mode() {
                fs::set_permissions(&outpath, fs::Permissions::from_mode(mode)).unwrap();
            }
        }
         */
    }

    return "Install finished".to_string();
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![install_chromium])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
