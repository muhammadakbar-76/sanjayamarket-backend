const delFoodBtn = document.querySelectorAll('.delete-food-btn');
const delFoodForm = document.querySelectorAll('.delete-food-form');

delFoodBtn.forEach((el, i) => {
  el.addEventListener('click', function (e) {
    e.preventDefault();
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          icon: 'success',
          title: 'Food has been deleted',
          showConfirmButton: false,
          timer: 2000,
        }).then((result) => {
          if (result.dismiss === Swal.DismissReason.timer) {
            delFoodForm[i].submit();
          }
        });
      }
    });
  });
});
