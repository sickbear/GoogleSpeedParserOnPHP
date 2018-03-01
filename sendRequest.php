<?php

    // Передаём в JS результатов парсинга sitemap.xml
    function getLinksFromSitemap($page) {
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
    }

    // Получаем от JS строку с адресом сайта
    $input = $_GET['siteAdress'];

    // Убираем '/' в конце строки, если он есть
    if ($input{strlen($input) - 1} == '/') {
        $input = substr($input, 0, -1);
    }

    // Ищем sitemap.xml на сайте
    if (@fopen($input . '/sitemap.xml', 'r')) {
        $page = simplexml_load_file($input . '/sitemap.xml');
        getLinksFromSitemap($page);
    } elseif (@fopen($input . '/sitemap', 'r')){
        $page = simplexml_load_file($input . '/sitemap');
        getLinksFromSitemap($page);
    } 


    
