$(document).ready(function () {
    $("#payment-customer-select").select2({
        ajax: {
            url: vmSavings.baseUrl + "/users/contacts",
            dataType: 'json',
            type: "POST",
            data: function (params) {
                return {
                    search: params.term, // search term
                    page: params.page
                };
            },
            processResults: function (data) {
                return {
                    results: $.map(data, function (item) {
                        return {
                            text: item.fullName,
                            id: item.contactsID
                        };
                    })
                };
            },
            cache: true
        }
    });
});

$('[data-toggle="btns"] .btn').on('click', function (event) {
    var tabContentId = jQuery(this).attr("id");

    if (tabContentId === 'btn-unresolved') {
        vmSavings.isUnresolvedTabActive = true;
    } else {
        vmSavings.isUnresolvedTabActive = false;
    }

    var $this = $(this);
    $this.parent().find('.active').removeClass('active');
    $this.addClass('active');
});

$(function () {

    var start = moment();
    var end = moment();

    function cb(start, end) {
        if (vmSavings.isUnresolvedTabActive) {
            vmSavings.dateUnresolvedFilter(start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD'));

        } else {
            vmSavings.dateFilter(start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD'));

        }
        $('#udaterangepicker span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
        $('#daterangepicker span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));

    }

    $('#udaterangepicker').daterangepicker({
        startDate: start,
        endDate: end,
        opens: 'left',
        ranges: {
            'Today': [moment(), moment()],
            'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
            'Last 7 Days': [moment().subtract(6, 'days'), moment()],
            'Last 30 Days': [moment().subtract(29, 'days'), moment()],
            'This Month': [moment().startOf('month'), moment().endOf('month')],
            'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
        }
    }, cb);

    cb(start, end);

    $('#daterangepicker').daterangepicker({
        startDate: start,
        endDate: end,
        opens: 'left',
        ranges: {
            'Today': [moment(), moment()],
            'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
            'Last 7 Days': [moment().subtract(6, 'days'), moment()],
            'Last 30 Days': [moment().subtract(29, 'days'), moment()],
            'This Month': [moment().startOf('month'), moment().endOf('month')],
            'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
        }
    }, cb);
    cb(start, end);

});

function reconcilePaymentModal() {
    $('#payment-reconcile').modal();
}

function formatNumber(num) {
    return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}

var columns = [
    {
        name: '__sequence',
        title: '#',
        titleClass: 'table-header',
        dataClass: 'table-data'
    },
    {
        name: 'memberName',
        title: 'Member Name',
        sortField: 'memberName',
        titleClass: 'table-header',
        dataClass: 'link-table-data',
        callback: 'customerName'

    },
    {
        name: 'savingsAmount',
        title: 'Amount',
        sortField: 'savingsAmount',
        titleClass: 'table-header',
        dataClass: 'table-data'
    },
    {
        name: 'createdAt',
        title: 'Date',
        sortField: 'createdAt',
        titleClass: 'table-header',
        dataClass: 'table-data',
        callback:'createdAt'
    }
    /*,
    {
        name: '__component:update-loan-action',
        title: 'Actions',
        titleClass: 'table-options-header',
        dataClass: 'table-options-data'
    }*/
];

Vue.component('update-loan-action', {
    template: [
        '<div >',
          '<button id="edit-savings" data-loading-text="ACTIVATING..." class="btn btn-sm bg-primary margin-right-xs" @click="itemAction(\'update-savings\', rowData)"><i class="fa fa-edit"></i></button>',
          '<button id="delete-savings" data-loading-text="DELETING..." class="btn btn-sm btn-danger margin-right-xs" @click="itemAction(\'delete-savings\', rowData)"><i class="fa fa-times"></i></button>',
        '</div>'
    ].join(''),

    props: {
        activateText: 'Text',
        rowData: {
            type: Object,
            required: true
        }
    },
    methods: {
        itemAction: function (action, data) {
          // // console.log("Updating a sale: " + JSON.stringify(data));
            if (action == 'update-savings') { 
               // vmSavings.savingsData = data;

                // if (data.status == 0) {
                //     updateLoanModal();
                // } else {
                //     payLoanModal();
                // }
               
            }
             else if (action == 'delete-savings') {
               // vmSavings.loanData = data;
                alertify.confirm('DELETE SALE', 'Are you sure you want to DELETE loan <strong>' + data.memberName + ' </strong> of KES. <strong>'+data.savingsAmount+' </strong> ?', function () {
                    vmSavings.deleteSavings(data.savingsId);
                }
                , function () {
                    return;
                });
            }
        }
    }
}); 



var vmSavings = new Vue({
    el: '#transactions-container',
    data: {
        unsavings_table_loading: false,
        savings_table_loading: false,
        initial_unresolved_loading: true,
        initial_resolved_loading: true,
        isUnresolvedTabActive: false,
        columns: columns,
        sortOrder: [{
                field: 'createdAt',
                direction: 'desc'
            }],
        unresolvedSortOrder: [{
                field: 'createdAt',
                direction: 'desc'
            }],
        multiSort: true,
        perPage: 10,
        unresolvedPerPage: 10,
        paginationComponent: 'vuetable-pagination',
        paginationInfoTemplate: 'Displaying {from} to {to} of {total} Savings',
        unresolvedPaginationInfoTemplate: 'Displaying {from} to {to} of {total} unknown payments',
        moreParams: ['filter=', 'start=', 'end=', 'isExport='],
        itemActions: [
            {
                name: 'reconcile',
                label: 'Reconcile',
                icon: 'fa fa-link',
                class: ' btn btn-success',
                extra: {'title': 'reconcile payment', 'data-toggle': "tooltip", 'data-placement': "left"}
            }
        ],
        search: '',
        search_unresolved: '',
        transactionData: '',
        serialNumber: '',
        resolvedToExport: '',
        unresolvedToExport: '',
        savings_amount:'',
        members:[],
        selected_member:'',
        total_savings:'',
        savingsData:[],
//        baseUrl: 'http://api.southwell.io/envirofit'
       baseUrl: baseUrl
    },
    computed: {
        unresolved_tab: function () {
            return this.isUnresolvedTabActive;
        },
        header_label: function () {
            if (this.isUnresolvedTabActive) {
                return 'Unknown Payments';
            } else {
                return 'Reconciled Payments';
            }
        },
        transaction: function () {
            return this.transactionData;
        },
        depositAmount: function () {
            return this.transactionData.depositAmount;
        }
    },
    methods: {
        customerName: function (value) {
            return '<strong>' + value + '</strong>';
        },
        createdAt: function (value) {
            if (!value) {
                return '-';
            } else {
                return moment(value).format('DD MMMM YYYY');
            }

        },
        dateFilter: function (start, end) {
            if (!this.initial_resolved_loading) {
                this.moreParams[1] = 'start=' + start;
                this.moreParams[2] = 'end=' + end;
                this.moreParams[3] = 'isExport='+true;
                this.$refs.vuetable_resolved.$nextTick(function () {
                    this.$dispatch('vuetable:refresh');
                });
            }
        },
        dateUnresolvedFilter: function (start, end) {
            if (!this.initial_unresolved_loading) {
                this.moreParams[1] = 'start=' + start;
                this.moreParams[2] = 'end=' + end;
                 this.moreParams[3] = 'isExport='+true;
                this.$refs.vuetable_unresolved.$nextTick(function () {
                    this.$dispatch('vuetable:refresh');
                });
            }
        },
        searchTransactions: function () {
            this.moreParams[0] = 'filter=' + this.search;
            this.$nextTick(function () {
                this.$refs.vuetable_resolved.$dispatch('vuetable:refresh');
            });
        },
        searchUnresolved: function () {
            this.moreParams[0] = 'filter=' + this.search_unresolved;
            this.$nextTick(function () {
                this.$refs.vuetable_unresolved.$dispatch('vuetable:refresh');
            });
        },
        reconcilePayment: function () {

            var contactsID = $('#payment-customer-select').val();

            if (!contactsID) {
                alertify.notify('Missing required data', 'error', 5, function () {});
                return;
            }

            $('#btn-reconcile').button('loading');
            var vm = this;
            axios.post(vm.baseUrl + '/transactions/reconcile', {
                contactsID: contactsID,
                transactionID: vm.transactionData.transactionID

            }).then(function (response) {
                var data = response.data;
               // console.log("Response received: " + JSON.stringify(data));
                $('#btn-reconcile').button('reset');
                if (data.status) {
                    vm.serialNumber = '';
                    vm.transactionData = '';
                    vm.$refs.vuetable_unresolved.$dispatch('vuetable:reload');
                    vm.$refs.vuetable_resolved.$dispatch('vuetable:reload');
                    alertify.notify(data.success, 'success', 5, function () {});
                    $('#payment-reconcile').modal('toggle');
                } else {
                    alertify.notify(data.error, 'error', 5, function () {});
                }
            }).catch(function (error) {
                $('#btn-reconcile').button('reset');
                alertify.notify(error, 'error', 5, function () {});
            });

        },
        exportResolved: function () {
            var data = [];

            for (var count = 0; count < this.resolvedToExport.length; count++) {

                var item = {
                    TRANSACTION_ID: this.resolvedToExport[count].transactionID,
                    TRANSACTION_REFERENCE: this.resolvedToExport[count].referenceNumber,
                    CUSTOMER: this.resolvedToExport[count].fullName,
                    DEPOSITOR: this.resolvedToExport[count].depositorName,
                    DEPOSITOR_MOBILE: this.resolvedToExport[count].mobile,
                    NATIONAL_ID: this.resolvedToExport[count].nationalID,
                    DEPOSIT_AMOUNT: this.resolvedToExport[count].depositAmount,
                    ACCOUNT: this.resolvedToExport[count].accountNumber,
                    DATE: this.resolvedToExport[count].createdAt
                };

                data.push(item);
            }

            exportDate = moment().format('DD_MMMM_YYYY_h:mm');

           // console.log("Exporting data: " + JSON.stringify(this.dataToExport));
            JSONToCSVConvertor(data, 'resolved_' + exportDate, 1);
        },
        exportUnresolved: function () {
            var data = [];

            for (var count = 0; count < this.unresolvedToExport.length; count++) {

                var item = {
                    TRANSACTION_ID: this.unresolvedToExport[count].transactionID,
                    TRANSACTION_REFERENCE: this.unresolvedToExport[count].referenceNumber,
                    ACCOUNT: this.unresolvedToExport[count].accountNumber,
                    DEPOSITOR: this.unresolvedToExport[count].depositorName,
                    DEPOSITOR_MOBILE: this.unresolvedToExport[count].mobile,
                    NATIONAL_ID: this.unresolvedToExport[count].nationalID,
                    DEPOSIT_AMOUNT: this.unresolvedToExport[count].depositAmount,
                    DATE: this.unresolvedToExport[count].createdAt
                };

                data.push(item);
            }

            exportDate = moment().format('DD_MMMM_YYYY_h:mm');

//           // console.log("Exporting data: " + JSON.stringify(this.dataToExport));
            JSONToCSVConvertor(data, 'unresolved_' + exportDate, 1);
        },
        paginationConfig: function (componentName) {
            if (componentName == 'vuetable-pagination') {
                this.$broadcast('vuetable-pagination:set-options', {
                    wrapperClass: 'pagination',
                    icons: {first: '', prev: '', next: '', last: ''},
                    activeClass: 'active primary',
                    linkClass: 'btn btn-default',
                    pageClass: 'btn btn-default'
                });
            }
            if (componentName == 'vuetable-pagination-dropdown') {
                this.$broadcast('vuetable-pagination:set-options', {
                    wrapperClass: 'form-inline',
                    icons: {prev: 'glyphicon glyphicon-chevron-left', next: 'glyphicon glyphicon-chevron-right'},
                    dropdownClass: 'form-control'
                });
            }
        }
    },
    watch: {
        perPage: function (val, oldVal) {
            this.$refs.vuetable_resolved.$dispatch('vuetable:refresh');
        },
        unresolvedPerPage: function (val, oldVal) {
            this.$refs.vuetable_unresolved.$dispatch('vuetable:refresh');
        },
        paginationComponent: function (val, oldVal) {
            this.$broadcast('vuetable:load-success', this.$refs.vuetable.tablePagination);
            this.paginationConfig(this.paginationComponent);
        }
    },
    ready: function () {},
    events: {
        'vuetable:row-changed': function (data) {
//           // console.log('row-changed:', data.name);
        },
        'vuetable:row-clicked': function (data, event) {
//           // console.log('row-clicked:', data.name);
        },
        'vuetable:cell-clicked': function (data, field, event) {
           // console.log("Transaction Data: "+JSON.stringify(data));
            if (field.name == 'fullName' && (data.customerID || data.prospectsID)) {
                var customerID = 0;
                var prospectsID = 0;

                if (data.customerID) {
                    customerID = data.customerID;
                }

                if (data.prospectsID) {
                    prospectsID = data.prospectsID;
                }

                window.location.href = this.baseUrl + "/customers/customer_redirect/" + customerID + "/" + prospectsID + "/" + data.contactsID;
            }
        },
        'vuetable:action': function (action, data) {

            if (action === 'reconcile') {
               // console.log("Transaction Data: " + JSON.stringify(data));
                this.transactionData = data;
                reconcilePaymentModal();
            }
        },
        'vuetable:loading': function () {
            if (this.initial_unresolved_loading) {
                this.unsavings_table_loading = true;
            }

            if (this.initial_resolved_loading) {
                this.savings_table_loading = true;
            }
        },
        'vuetable:load-success': function (response) {
            
            this.savings_table_loading = false;
            this.total_savings = response.data.totalSavingsAmount;
            this.savingsData = response.data;
        },
        'vuetable:load-error': function (response) {
            this.savings_table_loading = false;
            this.initial_resolved_loading = false;
            this.unsavings_table_loading = false;
            this.initial_unresolved_loading = false;
        }
    }
});