// ==UserScript==
// @include http://mail.google.com/*
// @include https://mail.google.com/*
// ==/UserScript==

var addreader = {};

addreader.load = function()
{
    var gbar, frame;
    
    frame = window.frames["canvas_frame"];
    if (frame == null)
    {
        return addreader.setTimeout();
    }
    
    gbar = frame.document.getElementById('gbar');
    if (gbar == null)
    {
        return addreader.setTimeout();
    }
    addreader.init(gbar);
}

addreader.init = function(gbar)
{
    var links, link, href, reader, photos, reader_p, photos_p, temp;;
    var reader_class, photos_class;
    
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
        addreader.fallback(links);
    }
  
    reader_p = reader.parentNode;
    reader_class = reader.className;
    photos_p = photos.parentNode;
    photos_class = photos.className;

    temp = reader_p.cloneNode(reader);
    reader.className = photos_class;
    photos.className = reader_class;

    reader_p.replaceChild(temp, reader);
    photos_p.replaceChild(reader, photos);
    reader_p.replaceChild(photos, temp);
    console.log('Success');
}

addreader.fallback = function (links) 
{
    var link, link_p, temp;

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