!include LogicLib.nsh

!macro kisakiSetEnVarRoot
  ${if} $installMode == "all"
    EnVar::SetHKLM
  ${else}
    EnVar::SetHKCU
  ${endif}
!macroend

!macro customInstall
  ; Create a small CLI shim so `kisaki` can be called from PATH.
  CreateDirectory "$INSTDIR\bin"
  FileOpen $0 "$INSTDIR\bin\kisaki.cmd" w
  ${if} ${Errors}
    DetailPrint "Failed to create CLI shim: $INSTDIR\bin\kisaki.cmd"
  ${else}
    FileWrite $0 "@echo off$\r$\n$\"$INSTDIR\${APP_EXECUTABLE_FILENAME}$\" %*$\r$\n"
    FileClose $0
  ${endif}

  ; Add the shim directory to PATH for the selected install scope.
  !insertmacro kisakiSetEnVarRoot
  EnVar::AddValue "Path" "$INSTDIR\bin"
  Pop $1
  ${if} $1 != 0
    DetailPrint "EnVar::AddValue returned $1"
  ${endif}
!macroend

!macro customUnInstall
  ; Keep PATH untouched during self-update; clean it on real uninstall.
  ${ifNot} ${isUpdated}
    !insertmacro kisakiSetEnVarRoot
    EnVar::DeleteValue "Path" "$INSTDIR\bin"
    Pop $1
    ${if} $1 != 0
    ${andIf} $1 != 3
    ${andIf} $1 != 5
      DetailPrint "EnVar::DeleteValue returned $1"
    ${endif}
  ${endif}
!macroend
