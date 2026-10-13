package com.example

import android.annotation.SuppressLint
import android.app.Activity
import android.app.DownloadManager
import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.net.Uri
import android.os.Bundle
import android.os.Environment
import android.view.View
import android.view.ViewGroup
import android.webkit.CookieManager
import android.webkit.GeolocationPermissions
import android.webkit.PermissionRequest
import android.webkit.URLUtil
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.WarningAmber
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.draw.scale
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import com.example.ui.theme.CyanAccent
import com.example.ui.theme.CyanBorder
import com.example.ui.theme.MyApplicationTheme
import com.example.ui.theme.SlateTextLight
import com.example.ui.theme.SlateTextMuted
import com.example.ui.theme.SlateTextSecondary
import com.example.ui.theme.SophisticatedDarkBg
import com.example.ui.theme.SophisticatedDarkElevated
import com.example.ui.theme.SophisticatedDarkSurface
import com.example.ui.theme.TealAccent
import com.example.ui.theme.TealLight
import com.example.ui.theme.TrackBg
import kotlinx.coroutines.delay

const val STARTUP_URL = "https://ai-pulse-learning-hub.vercel.app/student/dashboard"

class MainActivity : ComponentActivity() {

    private var filePathCallback: ValueCallback<Array<Uri>>? = null

    private val fileChooserLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (filePathCallback != null) {
            val results = if (result.resultCode == Activity.RESULT_OK && result.data != null) {
                val data = result.data
                val clipData = data?.clipData
                if (clipData != null) {
                    val count = clipData.itemCount
                    Array(count) { i -> clipData.getItemAt(i).uri }
                } else {
                    data?.data?.let { arrayOf(it) }
                }
            } else {
                null
            }
            filePathCallback?.onReceiveValue(results)
            filePathCallback = null
        }
    }

    private fun openFileChooser(callback: ValueCallback<Array<Uri>>, params: WebChromeClient.FileChooserParams?) {
        filePathCallback?.onReceiveValue(null)
        filePathCallback = callback

        try {
            val intent = params?.createIntent() ?: Intent(Intent.ACTION_GET_CONTENT).apply {
                addCategory(Intent.CATEGORY_OPENABLE)
                type = "*/*"
            }
            fileChooserLauncher.launch(intent)
        } catch (e: Exception) {
            filePathCallback?.onReceiveValue(null)
            filePathCallback = null
            Toast.makeText(this, "Unable to open file chooser", Toast.LENGTH_SHORT).show()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            MyApplicationTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = SophisticatedDarkBg
                ) {
                    MainScreen(
                        onOpenFileChooser = { cb, params -> openFileChooser(cb, params) }
                    )
                }
            }
        }
    }

    override fun onPause() {
        super.onPause()
        CookieManager.getInstance().flush()
    }

    override fun onStop() {
        super.onStop()
        CookieManager.getInstance().flush()
    }
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun MainScreen(
    onOpenFileChooser: (ValueCallback<Array<Uri>>, WebChromeClient.FileChooserParams?) -> Unit
) {
    val context = LocalContext.current
    var webViewInstance by remember { mutableStateOf<WebView?>(null) }
    var canGoBack by remember { mutableStateOf(false) }
    var pageProgress by remember { mutableFloatStateOf(0f) }
    var isLoading by remember { mutableStateOf(true) }
    var hasError by remember { mutableStateOf(false) }
    var showSplash by remember { mutableStateOf(true) }

    // Splash duration for branding polish
    LaunchedEffect(Unit) {
        delay(1400)
        showSplash = false
    }

    // Android back button: navigate back if WebView has history, otherwise exit
    BackHandler(enabled = canGoBack) {
        webViewInstance?.let { wv ->
            if (wv.canGoBack()) {
                wv.goBack()
            }
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(SophisticatedDarkBg)
            .statusBarsPadding()
            .navigationBarsPadding()
    ) {
        // Full screen WebView container
        AndroidView(
            modifier = Modifier.fillMaxSize(),
            factory = { ctx ->
                WebView(ctx).apply {
                    layoutParams = ViewGroup.LayoutParams(
                        ViewGroup.LayoutParams.MATCH_PARENT,
                        ViewGroup.LayoutParams.MATCH_PARENT
                    )
                    setBackgroundColor(android.graphics.Color.parseColor("#020617"))

                    // Configure WebSettings for modern web application & session persistence
                    settings.apply {
                        javaScriptEnabled = true
                        domStorageEnabled = true
                        databaseEnabled = true
                        cacheMode = WebSettings.LOAD_DEFAULT
                        loadWithOverviewMode = true
                        useWideViewPort = true
                        setSupportZoom(true)
                        builtInZoomControls = false
                        displayZoomControls = false
                        allowFileAccess = true
                        allowContentAccess = true
                        mediaPlaybackRequiresUserGesture = false
                        mixedContentMode = WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE
                        userAgentString = settings.userAgentString + " AIPulseStudentAndroid/1.0"
                    }

                    // Enable and preserve cookies & persistent session data
                    val cookieManager = CookieManager.getInstance()
                    cookieManager.setAcceptCookie(true)
                    cookieManager.setAcceptThirdPartyCookies(this, true)

                    // Download listener for study materials, PDF assignments, syllabus
                    setDownloadListener { url, userAgent, contentDisposition, mimeType, contentLength ->
                        try {
                            val request = DownloadManager.Request(Uri.parse(url)).apply {
                                setMimeType(mimeType)
                                val cookies = CookieManager.getInstance().getCookie(url)
                                addRequestHeader("cookie", cookies)
                                addRequestHeader("User-Agent", userAgent)
                                setDescription("Downloading file from AI PULSE Student Hub")
                                val filename = URLUtil.guessFileName(url, contentDisposition, mimeType)
                                setTitle(filename)
                                setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
                                setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, filename)
                            }
                            val dm = ctx.getSystemService(Context.DOWNLOAD_SERVICE) as? DownloadManager
                            dm?.enqueue(request)
                            Toast.makeText(ctx, "Download started...", Toast.LENGTH_SHORT).show()
                        } catch (e: Exception) {
                            try {
                                val fallbackIntent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                                ctx.startActivity(fallbackIntent)
                            } catch (ex: Exception) {
                                Toast.makeText(ctx, "Download failed", Toast.LENGTH_SHORT).show()
                            }
                        }
                    }

                    webChromeClient = object : WebChromeClient() {
                        override fun onProgressChanged(view: WebView?, newProgress: Int) {
                            pageProgress = newProgress / 100f
                            if (newProgress >= 100) {
                                isLoading = false
                            }
                        }

                        override fun onShowFileChooser(
                            webView: WebView?,
                            filePathCallback: ValueCallback<Array<Uri>>?,
                            fileChooserParams: FileChooserParams?
                        ): Boolean {
                            if (filePathCallback != null) {
                                onOpenFileChooser(filePathCallback, fileChooserParams)
                                return true
                            }
                            return false
                        }

                        override fun onGeolocationPermissionsShowPrompt(
                            origin: String?,
                            callback: GeolocationPermissions.Callback?
                        ) {
                            callback?.invoke(origin, true, false)
                        }

                        override fun onPermissionRequest(request: PermissionRequest?) {
                            request?.grant(request.resources)
                        }
                    }

                    webViewClient = object : WebViewClient() {
                        override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                            super.onPageStarted(view, url, favicon)
                            isLoading = true
                            hasError = false
                            canGoBack = view?.canGoBack() == true
                        }

                        override fun onPageFinished(view: WebView?, url: String?) {
                            super.onPageFinished(view, url)
                            isLoading = false
                            canGoBack = view?.canGoBack() == true
                            CookieManager.getInstance().flush()
                        }

                        override fun onReceivedError(
                            view: WebView?,
                            request: WebResourceRequest?,
                            error: WebResourceError?
                        ) {
                            super.onReceivedError(view, request, error)
                            if (request?.isForMainFrame == true) {
                                hasError = true
                                isLoading = false
                            }
                        }

                        override fun shouldOverrideUrlLoading(
                            view: WebView?,
                            request: WebResourceRequest?
                        ): Boolean {
                            val url = request?.url?.toString() ?: return false
                            return handleUrl(ctx, view, url)
                        }

                        @Deprecated("Deprecated in Java")
                        override fun shouldOverrideUrlLoading(view: WebView?, url: String?): Boolean {
                            if (url == null) return false
                            return handleUrl(ctx, view, url)
                        }

                        private fun handleUrl(ctx: Context, view: WebView?, url: String): Boolean {
                            return when {
                                url.startsWith("http://") || url.startsWith("https://") -> {
                                    // Keep all web navigation strictly inside WebView
                                    false
                                }
                                url.startsWith("mailto:") || url.startsWith("tel:") || url.startsWith("whatsapp:") -> {
                                    try {
                                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                                        ctx.startActivity(intent)
                                    } catch (e: ActivityNotFoundException) {
                                        // Ignore if no external handler
                                    }
                                    true
                                }
                                else -> {
                                    try {
                                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                                        ctx.startActivity(intent)
                                        true
                                    } catch (e: Exception) {
                                        false
                                    }
                                }
                            }
                        }
                    }

                    loadUrl(STARTUP_URL)
                    webViewInstance = this
                }
            },
            update = { wv ->
                webViewInstance = wv
            }
        )

        // Slim top progress bar during page transitions with glowing cyan gradient
        if (isLoading && !showSplash) {
            LinearProgressIndicator(
                progress = { pageProgress },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(2.5.dp)
                    .align(Alignment.TopCenter),
                color = CyanAccent,
                trackColor = TrackBg
            )
        }

        // Connection Error / Offline Fallback UI
        if (hasError && !isLoading && !showSplash) {
            ErrorOverlay(
                onRetry = {
                    hasError = false
                    isLoading = true
                    webViewInstance?.reload()
                }
            )
        }

        // Sophisticated Dark AI PULSE Student Splash Screen
        AnimatedVisibility(
            visible = showSplash,
            enter = fadeIn(),
            exit = fadeOut(animationSpec = tween(durationMillis = 400))
        ) {
            SplashScreenOverlay()
        }
    }

    DisposableEffect(Unit) {
        onDispose {
            CookieManager.getInstance().flush()
        }
    }
}

@Composable
fun SplashScreenOverlay() {
    val infiniteTransition = rememberInfiniteTransition(label = "pulseAnimation")
    val pulseScale by infiniteTransition.animateFloat(
        initialValue = 0.95f,
        targetValue = 1.05f,
        animationSpec = infiniteRepeatable(
            animation = tween(1400, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "pulseScale"
    )
    val beaconAlpha by infiniteTransition.animateFloat(
        initialValue = 0.4f,
        targetValue = 1.0f,
        animationSpec = infiniteRepeatable(
            animation = tween(900, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "beaconAlpha"
    )

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(SophisticatedDarkBg),
        contentAlignment = Alignment.Center
    ) {
        // Ambient background subtle glow
        Box(
            modifier = Modifier
                .size(280.dp)
                .clip(CircleShape)
                .background(
                    Brush.radialGradient(
                        colors = listOf(
                            CyanAccent.copy(alpha = 0.10f),
                            TealAccent.copy(alpha = 0.04f),
                            Color.Transparent
                        )
                    )
                )
        )

        // Subtle ambient accent lines
        Canvas(modifier = Modifier.fillMaxSize()) {
            val w = size.width
            val h = size.height

            // Top-left subtle vertical accent
            drawLine(
                brush = Brush.verticalGradient(
                    listOf(Color.Transparent, CyanAccent.copy(alpha = 0.2f), Color.Transparent),
                    startY = h * 0.1f,
                    endY = h * 0.25f
                ),
                start = Offset(40.dp.toPx(), h * 0.1f),
                end = Offset(40.dp.toPx(), h * 0.25f),
                strokeWidth = 1.dp.toPx()
            )

            // Bottom-right subtle vertical accent
            drawLine(
                brush = Brush.verticalGradient(
                    listOf(Color.Transparent, TealAccent.copy(alpha = 0.2f), Color.Transparent),
                    startY = h * 0.65f,
                    endY = h * 0.85f
                ),
                start = Offset(w - 48.dp.toPx(), h * 0.65f),
                end = Offset(w - 48.dp.toPx(), h * 0.85f),
                strokeWidth = 1.dp.toPx()
            )
        }

        // Center Content Block
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.SpaceBetween,
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 32.dp, vertical = 48.dp)
        ) {
            Spacer(modifier = Modifier.height(20.dp))

            // Main Branding Section
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                // Sophisticated Geometric AI PULSE Emblem
                Box(
                    modifier = Modifier
                        .size(136.dp)
                        .scale(pulseScale),
                    contentAlignment = Alignment.Center
                ) {
                    // Frame 1: 45 degree rotated rounded square border
                    Box(
                        modifier = Modifier
                            .size(96.dp)
                            .rotate(45f)
                            .border(2.dp, CyanAccent.copy(alpha = 0.30f), RoundedCornerShape(20.dp))
                    )

                    // Frame 2: -12 degree rotated rounded square border
                    Box(
                        modifier = Modifier
                            .size(86.dp)
                            .rotate(-12f)
                            .border(1.5.dp, CyanAccent.copy(alpha = 0.50f), RoundedCornerShape(18.dp))
                    )

                    // Center Core: Gradient Rounded Tile with Glowing Neural Matrix
                    Box(
                        modifier = Modifier
                            .size(52.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(
                                Brush.linearGradient(
                                    listOf(CyanAccent, TealAccent)
                                )
                            )
                            .border(1.dp, TealLight.copy(alpha = 0.6f), RoundedCornerShape(12.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        // 2x2 Neural Node Dots
                        Column(
                            verticalArrangement = Arrangement.spacedBy(5.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Row(horizontalArrangement = Arrangement.spacedBy(5.dp)) {
                                Box(
                                    modifier = Modifier
                                        .size(6.dp)
                                        .clip(CircleShape)
                                        .background(Color.White)
                                )
                                Box(
                                    modifier = Modifier
                                        .size(6.dp)
                                        .clip(CircleShape)
                                        .background(Color.White.copy(alpha = 0.5f))
                                )
                            }
                            Row(horizontalArrangement = Arrangement.spacedBy(5.dp)) {
                                Box(
                                    modifier = Modifier
                                        .size(6.dp)
                                        .clip(CircleShape)
                                        .background(Color.White.copy(alpha = 0.5f))
                                )
                                Box(
                                    modifier = Modifier
                                        .size(6.dp)
                                        .clip(CircleShape)
                                        .background(Color.White)
                                )
                            }
                        }
                    }

                    // Top-right glowing beacon node
                    Box(
                        modifier = Modifier
                            .align(Alignment.TopEnd)
                            .padding(top = 10.dp, end = 10.dp)
                            .size(11.dp)
                            .clip(CircleShape)
                            .background(CyanAccent.copy(alpha = beaconAlpha))
                            .border(1.5.dp, Color.White.copy(alpha = beaconAlpha), CircleShape)
                    )

                    // Bottom-left secondary teal node
                    Box(
                        modifier = Modifier
                            .align(Alignment.BottomStart)
                            .padding(bottom = 12.dp, start = 18.dp)
                            .size(7.dp)
                            .clip(CircleShape)
                            .background(TealLight.copy(alpha = 0.7f))
                    )
                }

                Spacer(modifier = Modifier.height(32.dp))

                // Brand Title Typography
                Text(
                    text = "AI PULSE",
                    color = SlateTextLight,
                    fontSize = 30.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 6.sp,
                    textAlign = TextAlign.Center
                )

                Spacer(modifier = Modifier.height(6.dp))

                Text(
                    text = "STUDENT",
                    color = CyanAccent,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Medium,
                    letterSpacing = 7.sp,
                    textAlign = TextAlign.Center
                )
            }

            // Bottom Status & Telemetry
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 16.dp)
            ) {
                // Futuristic Glowing Progress Bar
                Box(
                    modifier = Modifier
                        .fillMaxWidth(0.68f)
                        .height(3.dp)
                        .clip(RoundedCornerShape(3.dp))
                        .background(TrackBg)
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth(0.72f)
                            .height(3.dp)
                            .clip(RoundedCornerShape(3.dp))
                            .background(
                                Brush.horizontalGradient(
                                    listOf(CyanAccent, TealLight)
                                )
                            )
                    )
                }

                Spacer(modifier = Modifier.height(18.dp))

                Text(
                    text = "ESTABLISHING SECURE LINK",
                    color = CyanAccent.copy(alpha = 0.65f),
                    fontSize = 10.sp,
                    fontWeight = FontWeight.SemiBold,
                    letterSpacing = 2.5.sp
                )

                Spacer(modifier = Modifier.height(4.dp))

                Text(
                    text = "com.aipulse.student",
                    color = SlateTextMuted,
                    fontSize = 9.sp,
                    fontFamily = FontFamily.Monospace
                )
            }
        }
    }
}

@Composable
fun ErrorOverlay(onRetry: () -> Unit) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(SophisticatedDarkBg.copy(alpha = 0.97f)),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier
                .padding(32.dp)
                .clip(RoundedCornerShape(16.dp))
                .background(SophisticatedDarkSurface)
                .border(1.dp, CyanBorder, RoundedCornerShape(16.dp))
                .padding(horizontal = 24.dp, vertical = 32.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(64.dp)
                    .clip(CircleShape)
                    .background(SophisticatedDarkElevated)
                    .border(1.dp, CyanAccent.copy(alpha = 0.4f), CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.WarningAmber,
                    contentDescription = "Connection Warning",
                    tint = CyanAccent,
                    modifier = Modifier.size(32.dp)
                )
            }

            Spacer(modifier = Modifier.height(20.dp))

            Text(
                text = "Connection Error",
                color = SlateTextLight,
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold
            )

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "Unable to connect to AI PULSE Student Hub. Please verify your connection and tap Retry.",
                color = SlateTextSecondary,
                fontSize = 13.sp,
                textAlign = TextAlign.Center,
                lineHeight = 19.sp
            )

            Spacer(modifier = Modifier.height(24.dp))

            Button(
                onClick = onRetry,
                colors = ButtonDefaults.buttonColors(
                    containerColor = CyanAccent,
                    contentColor = SophisticatedDarkBg
                ),
                shape = RoundedCornerShape(8.dp),
                modifier = Modifier.height(42.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Refresh,
                    contentDescription = "Retry",
                    modifier = Modifier.size(18.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Retry Link",
                    fontWeight = FontWeight.SemiBold,
                    fontSize = 14.sp
                )
            }
        }
    }
}
