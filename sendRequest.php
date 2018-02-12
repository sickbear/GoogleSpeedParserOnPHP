<?php

    $input = $_GET['siteAdress'];
    if (@fopen($input . '/sitemap.xml', 'r')) {
        $page = simplexml_load_file($input . '/sitemap.xml');
    } elseif (@fopen($input . '/sitemap', 'r')){
        $page = simplexml_load_file($input . '/sitemap');
    } else {
        $page = '';
    }

    if (!empty($page)) {
        $link_list = array();
            foreach ($page->url as $url) {
                array_push($link_list, $url->loc);  
            }
        echo json_encode($link_list);
    } else {
        $link_list = '';
        echo json_encode($link_list);
    }
    
