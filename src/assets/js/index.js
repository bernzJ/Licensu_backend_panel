$(function () {
  $.fn.editable.defaults.mode = 'popup';
  var base_url = 'http://127.0.0.1:4210/';

  $(document).on('click', '#menu-action', function () {
    $('.sidebar').toggleClass('active');
    $('.main').toggleClass('active');
    $(this).toggleClass('active');

    if ($('.sidebar').hasClass('active')) {
      $(this).find('i').addClass('fa-close');
      $(this).find('i').removeClass('fa-bars');
    } else {
      $(this).find('i').addClass('fa-bars');
      $(this).find('i').removeClass('fa-close');
    }
  });

  // Add hover feedback on menu
  $(document).on('click', '#menu-action', function () {
    $('.sidebar').toggleClass('hovered');
  });

  function setAlert(type, message) {
    $('.alert').attr('class', 'alert ' + type);
    $('.alert .ww').html(message);
    $('.alert').css('display', 'block');
  }
  //table context menu

  function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }
  $(document).on('click', ".download-key", function () {
    var id = $(this).attr("data-pk");
    $.ajax({
      type: 'POST',
      url: base_url + 'readlicense',
      data: { id: id },
      success: function (msg) {
        if (msg.Error != null) {
          setAlert('alert-danger', msg.Error);
          return;
        }
        setAlert('alert-success', msg.key);
        download('key.bin', msg.key);
      },
      error: function (XMLHttpRequest, textStatus, errorThrown) {
        setAlert('alert-danger', errorThrown);
      }
    });
  });

  $(document).on('click', "#delete-key", function () {
    if (confirm('Are you sure you want to delete key ?')) {
      var id = $(this).attr("data-pk");
      $.ajax({
        type: 'POST',
        url: base_url + 'deletelicense',
        data: { id: id },
        success: function (msg) {
          if (msg.Error != null) {
            setAlert('alert-danger', msg.Error);
            return;
          }
          setAlert('alert-success', msg.success);
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
          setAlert('alert-danger', errorThrown);
        }
      });
    }
  });

  $(document).on('click', "#ban-key", function () {
    var id = $(this).attr("data-pk");
    $.ajax({
      type: 'POST',
      url: base_url + 'updatelicense',
      data: { pk: id, name: 'banned', value: true, OG: $('#old_data_' + id).attr('data-og-token'), old_token: $('#old_data_' + id).val() },
      success: function (msg) {
        if (msg.Error != null) {
          setAlert('alert-danger', msg.Error);
          return;
        }
        setAlert('alert-success', msg.success);
      },
      error: function (XMLHttpRequest, textStatus, errorThrown) {
        setAlert('alert-danger', errorThrown);
      }
    });
  });

  $(document).on('click', "#unban-key", function () {
    var id = $(this).attr("data-pk");
    $.ajax({
      type: 'POST',
      url: base_url + 'updatelicense',
      data: { pk: id, name: 'banned', value: false, OG: $('#old_data_' + id).attr('data-og-token'), old_token: $('#old_data_' + id).val() },
      success: function (msg) {
        if (msg.Error != null) {
          setAlert('alert-danger', msg.Error);
          return;
        }
        setAlert('alert-success', msg.success);
      },
      error: function (XMLHttpRequest, textStatus, errorThrown) {
        setAlert('alert-danger', errorThrown);
      }
    });
  });

  $(document).on('click', "#reset-ip-key", function () {
    var id = $(this).attr("data-pk");
    $.ajax({
      type: 'POST',
      url: base_url + 'updatelicense',
      data: { pk: id, name: 'resetips', value: 'true', OG: $('#old_data_' + id).attr('data-og-token'), old_token: $('#old_data_' + id).val() },
      success: function (msg) {
        if (msg.Error != null) {
          setAlert('alert-danger', msg.Error);
          return;
        }
        setAlert('alert-success', msg.success);
      },
      error: function (XMLHttpRequest, textStatus, errorThrown) {
        setAlert('alert-danger', errorThrown);
      }
    });
  });

  //ajax for CRUD
  $('.create_license').click(function () {
    if ($('.alert').css('display') == 'block') $('.alert').css('display', 'none');
    if ($('.ac_type').attr('data-actype') == '') {
      setAlert('alert-danger', 'You must select at least one plugin type.');
      return;
    }
    if ($('.days_plan').attr('data-dplan') == '') {
      setAlert('alert-danger', 'You must select at least one access type.');
      return;
    }
    if ($('.ip_restriction').attr('data-iplock') == '') {
      setAlert('alert-danger', 'You must select at least one IP restriction type.');
      return;
    }
    $.ajax({
      type: 'POST',
      url: base_url + 'createlicense',
      data: { plan: $('.days_plan').attr('data-dplan'), app_id: $('.app_id').val(), ipPlan: $('.ip_restriction').attr('data-IPlock') },
      success: function (msg) {
        if (msg.Error != null) {
          setAlert('alert-danger', msg.Error);
          return;
        }
        setAlert('alert-success', msg.Token);
      },
      error: function (XMLHttpRequest, textStatus, errorThrown) {
        setAlert('alert-danger', errorThrown);
      }
    });
  });


  //editable shit

  $("#clients-table").editable({
    selector: '#daysleft',
    url: 'updatelicense',
    type: 'text',
    placement: 'right',
    title: 'Enter days left',
    name: 'daysleft',
    params: { old_token: $('#old_data_' + $(this).find('#daysleft').attr('data-pk')).val(), OG: $('#old_data_' + $(this).find('#daysleft').attr('data-pk')).attr('data-og-token') },
    success: function (response, newValue) {
      setAlert('alert-success', 'Updated to: ' + newValue);
    }
  });
  //$(this).editable('toggle');
  /* button actions added
  $('#clients-table').editable({
    selector: '#banned',
    url: 'updatelicense',
    type: 'text',
    placement: 'right',
    title: 'Enter ban reason',
    name: 'banned',
    params: { old_token: $('#old_data_' + $(this).find('#banned').attr('data-pk')).val(), OG: $('#old_data_' + $(this).find('#banned').attr('data-pk')).attr('data-og-token') },
    success: function (response, newValue) {
      setAlert('alert-success', 'Updated to: ' + newValue);
    }
  });
  */
  $('#clients-table').editable({
    selector: '#hwid',
    url: 'updatelicense',
    type: 'text',
    placement: 'right',
    title: 'Enter a VALID hwid',
    name: 'hwid',
    params: { old_token: $('#old_data_' + $(this).find('#hwid').attr('data-pk')).val(), OG: $('#old_data_' + $(this).find('#hwid').attr('data-pk')).attr('data-og-token') },
    success: function (response, newValue) {
      setAlert('alert-success', 'Updated to: ' + newValue);
    }
  });
  let objIps = $.parseJSON(atob($(".dataips").val()));
  $('#clients-table').editable({
    selector: '#ipban',
    url: 'updatelicense',
    type: 'select',
    placement: 'top',
    title: 'Select a ip plan',
    name: 'ipban',
    params: { old_token: $('#old_data_' + $(this).find('#ipban').attr('data-pk')).val(), OG: $('#old_data_' + $(this).find('#ipban').attr('data-pk')).attr('data-og-token') },
    source: Object.keys(objIps).reduce((obj, key) => Object.assign({}, obj, { [objIps[key]]: key }), {}),//$.parseJSON(atob($(".dataips").val())),
    success: function (response, newValue) {
      setAlert('alert-success', 'Updated to: ' + newValue);
    }
  });

  // create product custom controls
  $('.btn_add_plan_days').click(function () {
    let numValue = $('.product_days_input').val();
    if ($.isNumeric(numValue)) {
      $('.days_plan ul').append('<li><a data-dplan="' + numValue + '">' + numValue + ' Days</a></li>');
      $('.product_days_input').val('');
    }
  });

  $('.btn_add_plan_connections').click(function () {
    let numValue1 = $('.product_HWID_input').val();
    let numValue2 = $('.product_IPS_input').val();

    if ($.isNumeric(numValue1) && $.isNumeric(numValue2)) {
      let outObj = { max_hwid: numValue1, max_ips: numValue2 };

      if (numValue1 == -1 && numValue2 == -1)
        $('.hwid_plan ul').append('<li><a data-iplock="' + btoa(JSON.stringify(outObj)) + '">Unlimited</a></li>');
      else
        $('.hwid_plan ul').append('<li><a data-iplock="' + btoa(JSON.stringify(outObj)) + '">' + numValue1 + ' different HWID and ' + numValue2 + ' connection at time.</a></li>');
      $('.product_HWID_input').val('');
      $('.product_IPS_input').val('');
    }
  });

  function droppy_remove(article) {
    if ($(article + '.selected').text() != '' && confirm('Are you sure ?')) {
      $('.dropy__content' + article + ' ul li a').each(function () {
        if ($(this).text() == $(article + '.selected').text()) {
          $(this).remove();
        }
      });
    }
  }

  $('.btn_remove_plan_connections').click(function () {
    if ($('.alert').css('display') == 'block') $('.alert').css('display', 'none');
    droppy_remove('.hwid_plan');
  });

  $('.btn_remove_plan_days').click(function () {
    if ($('.alert').css('display') == 'block') $('.alert').css('display', 'none');
    droppy_remove('.days_plan');
  });

  $('.edit_product').click(function (e) {
    let url = (window.location.href.indexOf('#')) ? window.location.href.replace('#', '') : window.location.href;
    if (location.href.indexOf('?')) {
      url += "&CRUD=u";
    } else {
      url += '?CRUD=u';
    }
    window.location.href = url;

  });

  $('.del_product').click(function () {
    if (confirm('Are you sure ?')) {
      $.ajax({
        type: 'POST',
        url: base_url + 'deleteproduct',
        data: { id: $('.app_id').val() },
        success: function (msg) {
          if (msg.Error != null) {
            setAlert('alert-danger', msg.Error);
            return;
          }
          setAlert('alert-success', msg.success);
        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
          setAlert('alert-danger', errorThrown);
        }
      });
    }
  });

  // same button is used for UPDATE
  $('.create_product').click(function () {
    if ($('.alert').css('display') == 'block') $('.alert').css('display', 'none');
    if ($('.product_name').val() == '') {
      setAlert('alert-danger', 'You must enter a product name.');
      return;
    }
    if ($('.product_version').val() == '') {
      setAlert('alert-danger', 'You must enter a product version.');
      return;
    }
    if ($('.product_MD5').val() == '') {
      setAlert('alert-danger', 'You must enter a product MD5 checksum.');
      return;
    }
    // Building objects
    let productDaysPlans = {};
    let childsDays = $('dd.days_plan ul').children('li');
    childsDays.each(function (index) {
      let current = $(this).children('a');
      if (!current.hasClass('dropy__header')) {
        productDaysPlans[current.text()] = current.attr('data-dplan');
      }
    });

    let productHWIDPlans = {};
    let childsHWID = $('dd.hwid_plan ul').children('li');
    childsHWID.each(function (index) {
      let current = $(this).children('a');
      if (!current.hasClass('dropy__header')) {
        productHWIDPlans[current.text()] = current.attr('data-iplock');
      }
    });
    if (jQuery.isEmptyObject(productDaysPlans) || jQuery.isEmptyObject(productHWIDPlans)) {
      setAlert('alert-danger', 'You must enter a day/ip plan.');
      return;
    }
    /*if ($.isNumeric($('.pid').val()) && $('.pid').attr('mode') == 'u') {
      //CRUD, U mode
    }*/
    let url_end = '';
    switch ($('.app_id').attr('mode')) {
      case 'c':
        url_end = 'createproduct';
        break;
      case 'u':
        url_end = 'updateproduct';
        break;
    }
    $.ajax({
      type: 'POST',
      url: base_url + url_end,
      data: { id: $('.app_id').val(), name: $('.product_name').val(), version: $('.product_version').val(), md5: $('.product_MD5').val(), dayPlans: JSON.stringify(productDaysPlans), hwidPlans: JSON.stringify(productHWIDPlans) },
      success: function (msg) {
        if (msg.Error != null) {
          setAlert('alert-danger', msg.Error);
          return;
        }
        setAlert('alert-success', msg.success);
      },
      error: function (XMLHttpRequest, textStatus, errorThrown) {
        setAlert('alert-danger', errorThrown);
      }
    });
  });
});

