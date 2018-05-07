package com.example.asuspc.librarydbwebview;

import android.content.Intent;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.View;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class MainActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);



        WebView wvBooks = findViewById(R.id.wvBooks);
        wvBooks.setWebViewClient(new WebViewClient());
        wvBooks.getSettings().setJavaScriptEnabled(true);
        wvBooks.loadUrl("http://librarydb.eu-4.evennode.com/static/books.html");
    }

    //Go to the add page

}
