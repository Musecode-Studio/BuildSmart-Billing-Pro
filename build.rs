fn main() {
    // Enable static CRT linking on Windows
    #[cfg(target_os = "windows")]
    {
        static_vcruntime::metabuild();
    }
    
    tauri_build::build()
}