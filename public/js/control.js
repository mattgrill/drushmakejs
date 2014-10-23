var control         = {
  drupalVersion     : '7.x',
  request           : function (options) {
    return jQuery.ajax(options);
  },
  init              : function () {
    $('#fs-version input').on('click', function (e) {
      // Set the Drupal Version
      control.drupalVersion = $(this).attr('value') + '.x';
      // Reset checkboxes.
      $('#generator #fs-contrib input')
        .attr('checked', false);
      $('#generator #fs-contrib select')
        .attr('disabled', 'disabled')
        .html('');
    });
    $('#generator #fs-contrib').on('click', 'label input', function (e) {
      var $this = $(this),
          $select,
          module_name,
          response;

      if ($this.is(':checked')) {
        $select         = $this.parent().children('select');
        module_name     = $select.attr('id');

        response    = control.request({
          type: 'GET',
          url: '/modules/'+control.drupalVersion+'/'+module_name,
          dataType: 'json'
        });

        response
          .fail( function (data, status, error) {
            /* If the request fails, do something */
          })
          .done( function (data, status) {
            $.each(data, function (index, value) {
              $select
                .append($('<option>', { 'value' : value })
                .text(value));
            })
            $select
              .removeAttr('disabled');
          })
      }
      else {
        $select         = $this.parent().children('select');
        $select
          .attr('disabled', 'disabled')
          .html('');
      }
    });
  }
}
