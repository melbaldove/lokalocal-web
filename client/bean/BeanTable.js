class BeanTable {
  constructor(el) {
    const url = `/api/bean`;
    this.setupDt(el, url);
  }

  setupDt(el, url){
    let dtColumns = [
      'beanName',
      ''
    ];

    $("#bean_table").DataTable({
      searching: false,
      processing: true,
      serverSide: true,
      ajax: {
        url: url,
        data: function (d) {
          d.filter = {
            limit: d.length,
            skip: d.start,
            order: dtColumns[d.order[0]['column']] + ` ${d.order[0]['dir'].toUpperCase()}`// propertyName ASC|DESC
          };
        },
        dataFilter: function(response){
          response = JSON.parse(response);

          let formatted = {
            recordsTotal: response.total,
            recordsFiltered: response.total,
            data: response.data,
          };

          return JSON.stringify( formatted );
        }
      },
      order: [[0, 'asc']],
      // createdRow: ( row, data, dataIndex ) => {
      //   $(row).find('td:eq(0)')
      //     .attr('data-schedule-id', data.id);
      // },
      columns: [
        // {
        //   className:      'details-control text-center',
        //   orderable:      false,
        //   data:           null,
        //   defaultContent: ''
        // },
        { data: 'beanName' },
        { data: null },
      ],
      columnDefs: [
        {
          targets: [0],
          orderable: false
        },
        {
          targets: [1],
          width: "210px",
          orderable: false,
          render: (type, data, row, meta) => {
            let button = '';

            button = `<a class="btn btn-primary" href="/bean/${row.id}"><i class="fa fa-pencil-square-o" aria-hidden="true" style="pointer-events: none"></i></a>`;
            //  button += `<btn class="btn btn-primary" type="button" data-toggle="modal" data-target="#myModal" data-cancel-schedule-id="${row.id}"><i class="fa fa-ban" aria-hidden="true" style="pointer-events: none"></i></btn>`;
            //  button += `<btn class="btn btn-primary" type="button" data-toggle="modal" data-target="#myModal" data-delete-schedule-id="${row.id}"><i class="fa fa-trash-o" aria-hidden="true" style="pointer-events: none"></i></btn>`;


            return button;
          },
        }
      ]
    })
  }
}

export default BeanTable;
