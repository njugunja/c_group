<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="shortcut icon" href="<?= $this->url->get('img/envirofit.png') ?>">

        <title><?= $page_title ?> | Covenant Group</title>
        <?= $this->tag->stylesheetLink('vendor/bootstrap-3.3.7/css/bootstrap.min.css') ?>
        <?= $this->tag->stylesheetLink('vendor/bootstrap-select/bootstrap-select.min.css') ?>
        <?= $this->tag->stylesheetLink('vendor/font-awesome-4.7.0/css/font-awesome.min.css') ?>
        <?= $this->tag->stylesheetLink('css/app.0.1.min.css') ?>
        <?= $this->tag->stylesheetLink('css/envirofit.css') ?>
        <?= $this->assets->outputCss() ?>
        <link href="https://fonts.googleapis.com/css?family=Roboto:400,700" rel="stylesheet">
        <link rel="stylesheet" href="//cdn.jsdelivr.net/alertifyjs/1.10.0/css/alertify.min.css"/>
        <link rel="stylesheet" href="//cdn.jsdelivr.net/alertifyjs/1.10.0/css/themes/default.min.css"/>
        <link rel="stylesheet" type="text/css" href="//cdn.jsdelivr.net/bootstrap.daterangepicker/2/daterangepicker.css" />
        <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/select2/4.0.3/css/select2.min.css" />
    </head>
    <body>
        <div id="application" class="container-fluid">
            <?= $this->getContent() ?>
        </div>
        <?= $this->tag->javascriptInclude('js/jquery-3.2.0.min.js') ?>
        <?= $this->tag->javascriptInclude('vendor/bootstrap-3.3.7/js/bootstrap.min.js') ?>
        <?= $this->tag->javascriptInclude('vendor/bootstrap-select/bootstrap-select.min.js') ?>
        <?= $this->tag->javascriptInclude('js/moment.min.js') ?>
        <?= $this->tag->javascriptInclude('js/covenant.js') ?>
        <?= $this->tag->javascriptInclude('js/axios.min.js') ?>
        <?= $this->tag->javascriptInclude('js/lodash.min.js') ?>
        <?= $this->tag->javascriptInclude('js/numeral.min.js') ?>
<?= $this->tag->javascriptInclude('js/exporter.js') ?>
        <?= $this->assets->outputJs() ?>
        <script src="//cdn.jsdelivr.net/alertifyjs/1.10.0/alertify.min.js"></script>
        <script type="text/javascript" src="//cdn.jsdelivr.net/bootstrap.daterangepicker/2/daterangepicker.js"></script>
        <script src="https://cdn.jsdelivr.net/select2/4.0.3/js/select2.min.js"></script>
        <script type="text/javascript">
            $(document).ready(function(){
                var path = window.location.pathname;
                path = path.replace(/\/$/, "");
                path = decodeURIComponent(path);

                $(".navigation a").each(function () {
                    var href = $(this).attr('href');
                    if (path.substring(0, href.length) === href) {
                        $(this).closest('li').addClass('active');
                        $(this).addClass('active-tab');
                    }
                });

                $(document).on('click', '#btn_password_change', function () {
                    axios.get('http://chamachetu.com/c_group/members/reset').then(function (response) {
                        var data = response.data;
                        console.log("Response received: " + JSON.stringify(data));
                        if (data.status) {
                            alertify.notify(data.success, 'success', 5, function () {});
                        } else {
                            alertify.notify(data.error, 'error', 5, function () {});
                        }
                    }).catch(function (error) {
                        alertify.notify(error, 'error', 5, function () {});
                    });
                });

                var start = moment().subtract(29, 'days');
            var end = moment();
            function cb(start, end) {
                $('#reportrange span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
            }

            $('#reportrange').daterangepicker({
                startDate: start,
                endDate: end,
                opens: "left",
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
        </script>
    </body>
</html>