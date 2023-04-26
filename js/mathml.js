(function () {
    "use strict";
    function getQueryObj () {
        var scripts = document.getElementsByTagName('script');
        var src = scripts[scripts.length - 1].src;
        var index = src.indexOf('?');
        var query = index > -1 ? src.slice(index + 1) : '';
        var queryObj = {};
        query.split('&').forEach(item => {
            var pair = item.split('=');
            queryObj[pair[0]] = pair[1];
        });
        return queryObj;
    }
    var queryObj = getQueryObj();
    window.addEventListener("load", function () {
        var box, div, link, namespaceURI;
        // First check whether the page contains any <math> element.
        namespaceURI = "http://www.w3.org/1998/Math/MathML";
        if (document.body.getElementsByTagNameNS(namespaceURI, "math")[0]) {
            // Create a div to test mspace, using Kuma's "offscreen" CSS
            document.body.insertAdjacentHTML("afterbegin", "<div style='border: 0; clip: rect(0 0 0 0); height: 1px; margin: -1px; overflow: hidden; padding: 0; position: absolute; width: 1px;'><math xmlns='" + namespaceURI + "'><mspace height='23px' width='77px'></mspace></math></div>");
            div = document.body.firstChild;
            box = div.firstChild.firstChild.getBoundingClientRect();
            document.body.removeChild(div);
            // Insert the mathml.css stylesheet.
            link = document.createElement("link");
            link.rel = "stylesheet";
            if (Math.abs(box.height - 23) > 1  || Math.abs(box.width - 77) > 1) {
                link.href = queryObj.fallback || '../../css/mathml-fallback.css';
            } else {
                link.href = queryObj.css || '../../css/mathml.css';
            }
            document.head.appendChild(link);
        }
    });
}());
