/* eslint-disable @typescript-eslint/ban-ts-comment */
import * as Swal from "sweetalert2";
import * as withReactContent from "sweetalert2-react-content";

// @ts-ignore
const ReactSwal = withReactContent(Swal).mixin({
  customClass: {
    confirmButton: "btn btn-lg btn-primary mx-2 px-5",
    cancelButton: "btn btn-lg btn-secondary mx-2 px-5"
  },
  buttonsStyling: false
});

const alert = (options: any) => ReactSwal.fire(options);

const confirm = (options = {}) =>
  alert({
    showCancelButton: true,
    showConfirmButton: true,
    ...options
  });

export async function showConfirm(options: any) {
  const result = await confirm(options);
  if (result.value !== true) return false;
  return true;
}

export async function notifySucess(options: any) {
  alert({
    icon: "success",
    ...options,
  });
}
