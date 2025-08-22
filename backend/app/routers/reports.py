from fastapi.responses import FileResponse

@router.get("/download_file")
def download_file(path: str, user=Depends(require_role(["pss_owner","pss_analyst","client_admin","client_readonly","auditor_readonly"]))):
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(path, filename=os.path.basename(path))
