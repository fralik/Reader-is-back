// ==UserScript==
// @include http://mail.google.com/*
// @include https://mail.google.com/*
// ==/UserScript==

var addreader = {};
var all_done = false;

addreader.load = function()
{
    var gbar, frame;
    
    if (all_done == true)
    {
        return ;
    }
        
    frame = window.frames["canvas_frame"];
    if (frame == null)
    {
        return addreader.setTimeout();
    }
    
    gbar = frame.document.getElementById('gbz'); // Google tends to change the name from time to time.
    if (gbar == null)
    {
        return addreader.setTimeout();
    }
    addreader.init(gbar);
}

/*
    Replace Photos link with Reader link. Photos is visible, Reader is not. 
    In order not to forget if I need it in 5 years, here is the algorithm in text:
    1. find Reader and Photos link nodes.
    2. get parents of these nodes (more_li_element and bar_li_element respectively)
    3. Class names of visible and hidden links are differ. Store them for further usage.
    4. Extract localized names of services (e.g. Photos is Fotos in German). The name of visible service
       is inside two spans.
    5. Add spans to Reader node.
    6. Set proper class names to visible/hidden links.
    7. Replace Photos with modified Reader and add Photos to the More menu.
*/
addreader.init = function(gbar)
{
    var links, link, href, reader, photos, reader_p, photos_p, temp;;
    var reader_class, photos_class;
    var reader_text;
    var i;
    
    var bar_li_element, more_li_element;
    var localized_reader_text, localized_photos_text;
    var hidden_link_class, visible_link_class;
        
    links = gbar.getElementsByTagName('a');
    protocol = window.location.protocol;
    for (var i = 0; i < links.length; i++) 
    {
        link = links[i];
        href = link.getAttribute('href');
        if (href.indexOf('reader') != -1)
        {
            reader = link;
        }
        if (href.indexOf('picasaweb') != -1)
        {
            photos = link;
        }

        // finish the loop as soon as we find the link
        if (photos !== undefined 
            && reader !== undefined)
        {
            break;
        }
    }
    if (photos === undefined
        || reader === undefined) 
    {
        return addreader.fallback(links);
    }
  
    bar_li_element = photos.parentNode;
    more_li_element = reader.parentNode;
    
    var bar_spans = photos.childNodes;
    
    hidden_link_class = reader.className;
    visible_link_class = photos.className;
    
    var j = 0;
    var span_ids = new Array();
    for (i = 0; i < bar_spans.length; i++)
    {
        if (bar_spans[i].nodeName != 'SPAN')
            continue;
        if (j == 1)
        {
            localized_photos_text = bar_spans[i].innerHTML;
            span_ids[j] = i;
            break;
        }
        span_ids[j] = i;
        j++;
    }
    localized_reader_text = reader.innerHTML;
    
    bar_spans[1].innerHTML = localized_reader_text;
    
    reader.innerHTML = '';
    for (i=0; i < span_ids.length; i++)
    {
        var cur_id = span_ids[i];
        temp = bar_spans[cur_id].cloneNode(true);
        reader.appendChild(temp);
    }
    
    reader.className = visible_link_class;
    
    photos.innerHTML = localized_photos_text;
    photos.className = hidden_link_class;
        
    temp = photos.cloneNode(true);    
    bar_li_element.replaceChild(reader, photos);
    more_li_element.appendChild(temp);
    
    console.log("Successfully brought Reader link back!");
    all_done = true;
}

addreader.fallback = function (links) 
{
    var link, link_p, temp;

    //alert('in fallback');
    link_p = links[0].parentNode;
    link = links[0].cloneNode();

    link.href = "https://reader.google.com";
    link.textContent = 'Reader';
    link_p.insertBefore(link, links[0]);

    console.log("Failback Success");
};

addreader.setTimeout = function() 
{
    setTimeout(addreader.load, 100);
};

window.addEventListener('DOMContentLoaded', function() 
{
    addreader.setTimeout();
}, false);