package com.minkkaeng.swell

import android.app.Activity
import android.graphics.Color
import android.os.Bundle
import android.widget.ScrollView
import android.widget.TextView
import android.widget.LinearLayout

class CrashActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val stackTrace = intent.getStringExtra("stacktrace") ?: "Unknown error"
        
        val layout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setBackgroundColor(Color.LTGRAY)
        }

        val title = TextView(this).apply {
            text = "🚨 SWELL 앱 네이티브 오류 감지 🚨"
            textSize = 18f
            setTextColor(Color.RED)
            setPadding(32, 32, 32, 16)
        }

        val message = TextView(this).apply {
            text = "개발자에게 아래의 에러 화면을 캡처해서 보여주세요!\n\n"
            textSize = 14f
            setTextColor(Color.BLACK)
            setPadding(32, 0, 32, 16)
        }

        val stackTv = TextView(this).apply {
            text = stackTrace
            textSize = 12f
            setTextColor(Color.DKGRAY)
            setPadding(32, 16, 32, 32)
            setTextIsSelectable(true)
        }

        layout.addView(title)
        layout.addView(message)
        layout.addView(stackTv)

        val scrollView = ScrollView(this).apply {
            addView(layout)
        }
        setContentView(scrollView)
    }
}
