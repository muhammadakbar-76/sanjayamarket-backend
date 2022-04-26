$('#tblDataFood').DataTable({
  ajax: { url: '/food/get-all', dataSrc: '' },
  columns: [
    {
      data: 'name',
      render: function (data) {
        return `<td style="white-space: normal;">
        <p class="text-xs font-weight-bold mb-0">${data}</p>
    </td>`;
      },
    },
    {
      data: 'description',
      render: function (data) {
        return `<td style="white-space: normal;">
      <p class="text-xs text-secondary mb-0">${data}</p>
  </td>`;
      },
    },
    {
      data: 'ingredients',
      render: function (data) {
        return `<td style="white-space: normal;">
      <p class="text-xs font-weight-bold mb-0">${data.join(', ')}</p>
  </td>`;
      },
    },
    {
      data: 'price',
      render: function (data) {
        return `<td style="white-space: normal;">
      <p class="text-xs text-secondary mb-0">${data}</p>
  </td>`;
      },
    },
    {
      data: 'types',
      render: function (data) {
        return `<td style="white-space: normal;">
    <p class="text-xs text-secondary mb-0">${data}</p>
</td>`;
      },
    },
    {
      data: 'picturePath',
      render: function (data) {
        return `<td style="white-space: normal;">
                      <img src=${data} alt="" class="rounded" width=100 height=100>
                  </td>`;
      },
    },
    {
      data: '_id',
      render: function (data) {
        return `<td class="align-middle">
          <a href="/food/edit/${data}" class="font-weight-bold text-xs btn bg-gradient-primary ms-2 mt-3">Edit</a>
          <form action="/food/${data}?_method=DELETE" method="post" id="${data}">
           <button type="submit" class="font-weight-bold text-xs btn bg-gradient-danger delete-food-btn" data-id="${data}">Delete</button>
           </form>
       </td>`;
      },
    },
  ],
});

$('#tblDataUser').DataTable({
  ajax: { url: '/user/get-all', dataSrc: '' },
  columns: [
    {
      data: 'name',
      render: function (data) {
        return `<td style="white-space: normal;">
        <p class="text-xs font-weight-bold mb-0">${data}</p>
    </td>`;
      },
    },
    {
      data: 'email',
      render: function (data) {
        return `<td style="white-space: normal;">
      <p class="text-xs text-secondary mb-0">${data}</p>
  </td>`;
      },
    },
    {
      data: 'address',
      render: function (data) {
        return `<td style="white-space: normal;">
      <p class="text-xs font-weight-bold mb-0">${data}</p>
  </td>`;
      },
    },
    {
      data: 'phoneNumber',
      render: function (data) {
        return `<td style="white-space: normal;">
      <p class="text-xs text-secondary mb-0">${data}</p>
  </td>`;
      },
    },
    {
      data: 'city',
      render: function (data) {
        return `<td style="white-space: normal;">
    <p class="text-xs text-secondary mb-0">${data}</p>
</td>`;
      },
    },
    {
      data: 'role',
      render: function (data) {
        return `<td style="white-space: normal;">
    <p class="text-xs text-secondary mb-0">${data}</p>
</td>`;
      },
    },
    {
      data: 'houseNumber',
      render: function (data) {
        return `<td style="white-space: normal;">
    <p class="text-xs text-secondary mb-0">${data}</p>
</td>`;
      },
    },
    {
      data: 'photoPath',
      render: function (data) {
        return `<td style="white-space: normal;">
                      <img src=${data} alt="" class="rounded" width=100 height=100>
                  </td>`;
      },
    },
    {
      data: '_id',
      render: function (data) {
        return `<td class="align-middle">
          <a href="/user/edit/${data}" class="font-weight-bold text-xs btn bg-gradient-primary ms-2 mt-3">Edit</a>
          <form action="/user/${data}?_method=DELETE" method="post" id="${data}">
           <button type="submit" class="font-weight-bold text-xs btn bg-gradient-danger delete-user-btn" data-id="${data}">Delete</button>
           </form>
       </td>`;
      },
    },
  ],
});

$('#tblDataOrders').DataTable({
  ajax: { url: '/transaction/get-all', dataSrc: '' },
  columns: [
    {
      data: 'user.email',
      render: function (data) {
        return `<td style="white-space: normal;">
        <p class="text-xs font-weight-bold mb-0">${data}</p>
    </td>`;
      },
    },
    {
      data: 'food.name',
      render: function (data) {
        return `<td style="white-space: normal;">
      <p class="text-xs text-secondary mb-0">${data}</p>
  </td>`;
      },
    },
    {
      data: 'food.price',
      render: function (data) {
        return `<td style="white-space: normal;">
      <p class="text-xs font-weight-bold mb-0">${data}</p>
  </td>`;
      },
    },
    {
      data: 'food.quantity',
      render: function (data) {
        return `<td style="white-space: normal;">
      <p class="text-xs text-secondary mb-0">${data}</p>
  </td>`;
      },
    },
    {
      data: 'food.status',
      render: function (data) {
        return `<td style="white-space: normal;">
    <p class="text-xs text-secondary mb-0">${data}</p>
</td>`;
      },
    },
    {
      data: 'date',
      render: function (data) {
        return `<td style="white-space: normal;">
    <p class="text-xs text-secondary mb-0">${data}</p>
</td>`;
      },
    },
    {
      data: '_id',
      render: function (data) {
        return `<td class="align-middle">
        <div class="d-flex">
          <a href="/transaction/edit/${data}" class="font-weight-bold text-xs btn bg-gradient-primary mt-3 me-2">Edit</a>
          <a href="/transaction/detail/${data}" class="font-weight-bold text-xs btn bg-gradient-secondary mt-3 me-2">Details</a>
          <form action="/transaction/${data}?_method=DELETE" method="post" id="${data}">
           <button type="submit" class="font-weight-bold text-xs btn bg-gradient-danger delete-transaction-btn mt-3" data-id="${data}">Delete</button>
           </form>
           </div>
       </td>`;
      },
    },
  ],
});

$('body').on('click', '.delete-user-btn', function (e) {
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
        title: 'User has been deleted',
        showConfirmButton: false,
        timer: 2000,
      }).then((result) => {
        if (result.dismiss === Swal.DismissReason.timer) {
          $(`#${$(this).data('id')}`).submit();
        }
      });
    }
  });
});

$('body').on('click', '.delete-food-btn', function (e) {
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
          $(`#${$(this).data('id')}`).submit();
        }
      });
    }
  });
});

$('body').on('click', '.delete-transaction-btn', function (e) {
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
        title: 'Transaction has been deleted',
        showConfirmButton: false,
        timer: 2000,
      }).then((result) => {
        if (result.dismiss === Swal.DismissReason.timer) {
          $(`#${$(this).data('id')}`).submit();
        }
      });
    }
  });
});
