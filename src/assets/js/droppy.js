/**
 * Dropy
 */
var dropy = {
  $dropys: null,
  openClass: 'open',
  selectClass: 'selected',
  init: function(){
    var self = this;

    self.$dropys = $('.dropy');
    self.eventHandler();
  },
  eventHandler: function(){
    var self = this;

    // Opening a dropy
    self.$dropys.find('.dropy__title').click(function(){
      self.$dropys.removeClass(self.openClass);
      $(this).parents('.dropy').addClass(self.openClass);
    });

    // Click on a dropy list
    self.$dropys.find('.dropy__content ul li a').click(function(){
      var $that = $(this);
      var $dropy = $that.parents('.dropy');
      var $input = $dropy.find('input');
      var $title = $(this).parents('.dropy').find('.dropy__title span');
      var $ac =  $(".ac_type");

      //handle multi select
      if($that.closest('.mutliselect') .length > 0) {
        var checkbox = $that.closest('li').children('input[type="checkbox"]');
        checkbox.click(); 
        if(checkbox.is(':checked'))
        {
          var titleArray = ($title.text() == 'Access Type') ? $that.text() + ', ' : $title.text() + $that.text() + ', ';
          var tokenArray = ($ac.attr('data-actype') == '') ? checkbox.attr('data_attr_name') : $ac.attr('data-actype') + '.' + checkbox.attr('data_attr_name');
          $ac.attr('data-actype', tokenArray);
          $title.html(titleArray);
        }else{
          var titleArray = $title.text().replace($that.text() + ', ', ''); 
          if(titleArray == '')titleArray = 'Access Type';
          $title.html(titleArray);
          if($ac.attr('data-actype').indexOf('.' + checkbox.attr('data_attr_name')) >= 0)
          {
            $ac.attr('data-actype', $ac.attr('data-actype').replace('.' + checkbox.attr('data_attr_name'), ''));
          }
          else{
            $ac.attr('data-actype', $ac.attr('data-actype').replace(checkbox.attr('data_attr_name'), ''));
          }
            
        }
        return;
      } 

      // Remove selected class
      $dropy.find('.dropy__content a').each(function(){
        $(this).removeClass(self.selectClass);
      });

      // Update selected value
      $title.html($that.html());
      if($that.html() != 'License Type' && $that.html() != 'Maximum IPS')
      {
        if($that[0].hasAttribute('data-dplan'))
          $('.days_plan').attr('data-dplan', $that.attr('data-dplan'));
        if($that[0].hasAttribute('data-IPlock'))
          $('.ip_restriction').attr('data-IPlock', $that.attr('data-IPlock'));
      }
        
      $input.val($that.attr('data-value')).trigger('change');

      // If back to default, remove selected class else addclass on right element
      if($that.hasClass('dropy__header')){
        $title.removeClass(self.selectClass);
        $title.html($title.attr('data-title'));
      }
      else{
        $title.addClass(self.selectClass);
        $that.addClass(self.selectClass);
      }

      // Close dropdown
      $dropy.removeClass(self.openClass);
    });

    // Close all dropdown onclick on another element
    $(document).bind('click', function(e){
        if (! $(e.target).parents().hasClass('dropy')){ self.$dropys.removeClass(self.openClass); }
    });
  }
};

$(function(){
  dropy.init();
});