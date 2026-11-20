import { AndroidXmlFile } from '../types';

export const ANDROID_XML_TEMPLATES: AndroidXmlFile[] = [
  {
    name: 'activity_home.xml',
    path: 'res/layout/activity_home.xml',
    language: 'xml',
    description: 'واجهة الشاشة الرئيسية الكاملة مع شريط البحث، محدد المحافظات، وشريط التصنيفات الأفقي القابل للتمرير وقائمة الإعلانات',
    code: `<?xml version="1.0" encoding="utf-8"?>
<!-- 
  سوق الدواجن والطيور العراقي - Iraqi Poultry & Birds Marketplace
  Home Screen Layout with RTL Support & Eco-Green Branding (#27AE60)
-->
<androidx.coordinatorlayout.widget.CoordinatorLayout 
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="@color/bg_soft_gray"
    android:layoutDirection="rtl"
    android:textDirection="rtl">

    <!-- Top App Bar & Header Container -->
    <com.google.android.material.appbar.AppBarLayout
        android:id="@+id/appBarLayout"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:background="@color/card_white"
        app:elevation="1dp">

        <LinearLayout
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:orientation="vertical"
            android:paddingStart="16dp"
            android:paddingEnd="16dp"
            android:paddingTop="12dp"
            android:paddingBottom="12dp">

            <!-- Top Row: App Title & City Selector (Clean Main Header without back arrow) -->
            <LinearLayout
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:orientation="horizontal"
                android:gravity="center_vertical">

                <!-- App Branding (Right side in RTL) -->
                <LinearLayout
                    android:layout_width="0dp"
                    android:layout_height="wrap_content"
                    android:layout_weight="1"
                    android:orientation="vertical">

                    <TextView
                        android:id="@+id/tvAppTitle"
                        android:layout_width="wrap_content"
                        android:layout_height="wrap_content"
                        android:text="@string/app_name"
                        android:textColor="@color/text_primary"
                        android:textSize="18sp"
                        android:textStyle="bold"
                        android:fontFamily="sans-serif-medium" />

                    <TextView
                        android:id="@+id/tvSubtitle"
                        android:layout_width="wrap_content"
                        android:layout_height="wrap_content"
                        android:text="@string/app_tagline"
                        android:textColor="@color/text_secondary"
                        android:textSize="12sp" />
                </LinearLayout>

                <!-- City Selector Button / Filter -->
                <com.google.android.material.button.MaterialButton
                    android:id="@+id/btnCityFilter"
                    style="@style/Widget.Material3.Button.TonalButton"
                    android:layout_width="wrap_content"
                    android:layout_height="38dp"
                    android:text="@string/selected_city_default"
                    android:textColor="@color/eco_green"
                    android:textSize="13sp"
                    android:insetTop="0dp"
                    android:insetBottom="0dp"
                    app:backgroundTint="@color/eco_green_light"
                    app:cornerRadius="19dp"
                    app:icon="@drawable/ic_location_on_24"
                    app:iconGravity="textStart"
                    app:iconPadding="6dp"
                    app:iconTint="@color/eco_green" />

                <!-- Circular Info Icon Button (i) on Far Left opposite App Name -->
                <com.google.android.material.button.MaterialButton
                    android:id="@+id/btnAboutApp"
                    style="@style/Widget.Material3.Button.IconButton.Outlined"
                    android:layout_width="36dp"
                    android:layout_height="36dp"
                    android:layout_marginStart="6dp"
                    android:contentDescription="@string/about_app"
                    app:backgroundTint="@color/bg_soft_gray"
                    app:cornerRadius="18dp"
                    app:icon="@android:drawable/ic_dialog_info"
                    app:iconSize="18dp"
                    app:iconTint="@color/eco_green"
                    app:strokeColor="@color/border_hairline"
                    app:strokeWidth="1dp" />
            </LinearLayout>

            <!-- Search Bar Field -->
            <com.google.android.material.textfield.TextInputLayout
                android:id="@+id/searchBarLayout"
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:layout_marginTop="10dp"
                app:boxBackgroundMode="filled"
                app:boxBackgroundColor="@color/bg_input_field"
                app:boxCornerRadiusTopStart="14dp"
                app:boxCornerRadiusTopEnd="14dp"
                app:boxCornerRadiusBottomStart="14dp"
                app:boxCornerRadiusBottomEnd="14dp"
                app:boxStrokeWidth="0dp"
                app:boxStrokeWidthFocused="1dp"
                app:boxStrokeColor="@color/eco_green"
                app:hintEnabled="false"
                app:startIconDrawable="@drawable/ic_search_24"
                app:startIconTint="@color/text_secondary"
                app:endIconMode="clear_text">

                <com.google.android.material.textfield.TextInputEditText
                    android:id="@+id/etSearchInput"
                    android:layout_width="match_parent"
                    android:layout_height="48dp"
                    android:hint="@string/search_hint"
                    android:inputType="text"
                    android:paddingTop="10dp"
                    android:paddingBottom="10dp"
                    android:textColor="@color/text_primary"
                    android:textColorHint="@color/text_hint"
                    android:textSize="14sp" />
            </com.google.android.material.textfield.TextInputLayout>

        </LinearLayout>

        <!-- Horizontal Scrollable Category Bar with Pill Buttons -->
        <HorizontalScrollView
            android:id="@+id/categoryScrollView"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:fillViewport="false"
            android:paddingTop="4dp"
            android:paddingBottom="12dp"
            android:scrollbars="none"
            android:overScrollMode="never">

            <LinearLayout
                android:id="@+id/categoryContainer"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:orientation="horizontal"
                android:paddingStart="16dp"
                android:paddingEnd="16dp">

                <!-- Pill 1: الكل (Active by Default with Eco-Green Solid Fill) -->
                <com.google.android.material.button.MaterialButton
                    android:id="@+id/pillCategoryAll"
                    style="@style/Widget.Material3.Button"
                    android:layout_width="wrap_content"
                    android:layout_height="42dp"
                    android:layout_marginStart="0dp"
                    android:layout_marginEnd="8dp"
                    android:text="@string/category_all"
                    android:textColor="@color/card_white"
                    android:textSize="14sp"
                    android:textStyle="bold"
                    android:insetTop="0dp"
                    android:insetBottom="0dp"
                    app:backgroundTint="@color/eco_green"
                    app:cornerRadius="21dp"
                    app:elevation="0dp" />

                <!-- Pill 2: 🐓 دواجن (Inactive: Soft Gray with Dark Text) -->
                <com.google.android.material.button.MaterialButton
                    android:id="@+id/pillCategoryPoultry"
                    style="@style/Widget.Material3.Button.TonalButton"
                    android:layout_width="wrap_content"
                    android:layout_height="42dp"
                    android:layout_marginEnd="8dp"
                    android:text="@string/category_poultry"
                    android:textColor="@color/text_primary"
                    android:textSize="14sp"
                    android:insetTop="0dp"
                    android:insetBottom="0dp"
                    app:backgroundTint="@color/bg_pill_inactive"
                    app:cornerRadius="21dp"
                    app:elevation="0dp" />

                <!-- Pill 3: 🕊️ طيور وحمام (Inactive) -->
                <com.google.android.material.button.MaterialButton
                    android:id="@+id/pillCategoryBirds"
                    style="@style/Widget.Material3.Button.TonalButton"
                    android:layout_width="wrap_content"
                    android:layout_height="42dp"
                    android:layout_marginEnd="8dp"
                    android:text="@string/category_birds"
                    android:textColor="@color/text_primary"
                    android:textSize="14sp"
                    android:insetTop="0dp"
                    android:insetBottom="0dp"
                    app:backgroundTint="@color/bg_pill_inactive"
                    app:cornerRadius="21dp"
                    app:elevation="0dp" />

                <!-- Pill 4: 🌾 أعلاف ومستلزمات (Inactive) -->
                <com.google.android.material.button.MaterialButton
                    android:id="@+id/pillCategoryFeed"
                    style="@style/Widget.Material3.Button.TonalButton"
                    android:layout_width="wrap_content"
                    android:layout_height="42dp"
                    android:layout_marginEnd="8dp"
                    android:text="@string/category_feed"
                    android:textColor="@color/text_primary"
                    android:textSize="14sp"
                    android:insetTop="0dp"
                    android:insetBottom="0dp"
                    app:backgroundTint="@color/bg_pill_inactive"
                    app:cornerRadius="21dp"
                    app:elevation="0dp" />

                <!-- Pill 5: 💊 أدوية وبيطرة (Inactive) -->
                <com.google.android.material.button.MaterialButton
                    android:id="@+id/pillCategoryVet"
                    style="@style/Widget.Material3.Button.TonalButton"
                    android:layout_width="wrap_content"
                    android:layout_height="42dp"
                    android:layout_marginEnd="16dp"
                    android:text="@string/category_vet"
                    android:textColor="@color/text_primary"
                    android:textSize="14sp"
                    android:insetTop="0dp"
                    android:insetBottom="0dp"
                    app:backgroundTint="@color/bg_pill_inactive"
                    app:cornerRadius="21dp"
                    app:elevation="0dp" />

            </LinearLayout>
        </HorizontalScrollView>

        <!-- =================================================================== -->
        <!-- Top Banner Slider Container (ViewPager2)                             -->
        <!-- Dynamic Visibility in Kotlin:                                       -->
        <!-- - If size == 0 or null: View.GONE (no blank space shown)            -->
        <!-- - If size > 0: View.VISIBLE + auto-scrolling ViewPager2             -->
        <!-- =================================================================== -->
        <FrameLayout
            android:id="@+id/bannerSliderContainer"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:paddingStart="12dp"
            android:paddingEnd="12dp"
            android:paddingTop="6dp"
            android:paddingBottom="6dp"
            android:visibility="gone"
            tools:visibility="visible">

            <androidx.cardview.widget.CardView
                android:layout_width="match_parent"
                android:layout_height="145dp"
                app:cardCornerRadius="16dp"
                app:cardElevation="2dp"
                app:cardBackgroundColor="@color/card_white">

                <!-- ViewPager2 for Banner Slider -->
                <androidx.viewpager2.widget.ViewPager2
                    android:id="@+id/bannerViewPager"
                    android:layout_width="match_parent"
                    android:layout_height="match_parent" />

                <!-- Dots Indicator for Active Slide -->
                <com.google.android.material.tabs.TabLayout
                    android:id="@+id/bannerDotsIndicator"
                    android:layout_width="wrap_content"
                    android:layout_height="20dp"
                    android:layout_gravity="bottom|center_horizontal"
                    android:layout_marginBottom="8dp"
                    android:background="@android:color/transparent"
                    app:tabBackground="@drawable/selector_banner_dot"
                    app:tabGravity="center"
                    app:tabIndicatorHeight="0dp"
                    app:tabRippleColor="@null" />

            </androidx.cardview.widget.CardView>
        </FrameLayout>

    </com.google.android.material.appbar.AppBarLayout>

    <!-- Content Feed: SwipeRefreshLayout & RecyclerView for Listings -->
    <androidx.swiperefreshlayout.widget.SwipeRefreshLayout
        android:id="@+id/swipeRefresh"
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        app:layout_behavior="@string/appbar_scrolling_view_behavior">

        <androidx.recyclerview.widget.RecyclerView
            android:id="@+id/rvListings"
            android:layout_width="match_parent"
            android:layout_height="match_parent"
            android:clipToPadding="false"
            android:paddingStart="12dp"
            android:paddingEnd="12dp"
            android:paddingTop="12dp"
            android:paddingBottom="60dp"
            tools:listitem="@layout/item_listing_card" />

    </androidx.swiperefreshlayout.widget.SwipeRefreshLayout>

    <!-- Google AdMob Banner Container Placeholder (Adaptive 320x50 Banner at Bottom) -->
    <FrameLayout
        android:id="@+id/adMobBannerContainer"
        android:layout_width="match_parent"
        android:layout_height="50dp"
        android:layout_gravity="bottom"
        android:background="@color/bg_input_field">

        <!-- In production replace with: com.google.android.gms.ads.AdView -->
        <TextView
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:layout_gravity="center"
            android:text="@string/admob_placeholder_text"
            android:textColor="@color/text_hint"
            android:textSize="11sp" />
    </FrameLayout>

</androidx.coordinatorlayout.widget.CoordinatorLayout>
`
  },
  {
    name: 'item_listing_card.xml',
    path: 'res/layout/item_listing_card.xml',
    language: 'xml',
    description: 'عنصر بطاقة الإعلان في القائمة (MaterialCardView) مع صورة، السعر بالدينار، الموقع، وأزرار الاتصال والواتساب',
    code: `<?xml version="1.0" encoding="utf-8"?>
<com.google.android.material.card.MaterialCardView 
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:layout_marginBottom="12dp"
    android:layoutDirection="rtl"
    android:textDirection="rtl"
    app:cardBackgroundColor="@color/card_white"
    app:cardCornerRadius="16dp"
    app:cardElevation="2dp"
    app:strokeColor="@color/border_hairline"
    app:strokeWidth="1dp">

    <androidx.constraintlayout.widget.ConstraintLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:padding="12dp">

        <!-- Product / Animal Image -->
        <com.google.android.material.imageview.ShapeableImageView
            android:id="@+id/ivListingImage"
            android:layout_width="100dp"
            android:layout_height="100dp"
            android:scaleType="centerCrop"
            app:layout_constraintTop_toTopOf="parent"
            app:layout_constraintStart_toStartOf="parent"
            app:shapeAppearanceOverlay="@style/ShapeAppearance.App.RoundedImage"
            tools:src="@tools:sample/backgrounds/scenic" />

        <!-- Verified Badge Overlay -->
        <TextView
            android:id="@+id/tvBadgeVerified"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:layout_margin="4dp"
            android:background="@drawable/bg_badge_verified"
            android:paddingStart="6dp"
            android:paddingEnd="6dp"
            android:paddingTop="2dp"
            android:paddingBottom="2dp"
            android:text="@string/badge_verified"
            android:textColor="@color/card_white"
            android:textSize="10sp"
            android:textStyle="bold"
            app:layout_constraintTop_toTopOf="@id/ivListingImage"
            app:layout_constraintStart_toStartOf="@id/ivListingImage" />

        <!-- Listing Title -->
        <TextView
            android:id="@+id/tvTitle"
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_marginStart="12dp"
            android:layout_marginEnd="4dp"
            android:ellipsize="end"
            android:maxLines="2"
            android:textColor="@color/text_primary"
            android:textSize="15sp"
            android:textStyle="bold"
            app:layout_constraintTop_toTopOf="parent"
            app:layout_constraintStart_toEndOf="@id/ivListingImage"
            app:layout_constraintEnd_toStartOf="@id/btnFavorite"
            tools:text="دجاج بلدي عربي بياض أصيل وديوك فواخر" />

        <!-- Favorite Button -->
        <ImageButton
            android:id="@+id/btnFavorite"
            android:layout_width="36dp"
            android:layout_height="36dp"
            android:background="?attr/selectableItemBackgroundBorderless"
            android:contentDescription="@string/desc_fav"
            android:src="@drawable/ic_favorite_border_24"
            app:tint="@color/text_secondary"
            app:layout_constraintTop_toTopOf="parent"
            app:layout_constraintEnd_toEndOf="parent" />

        <!-- Location & Governorate -->
        <LinearLayout
            android:id="@+id/layoutLocation"
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_marginStart="12dp"
            android:layout_marginTop="4dp"
            android:gravity="center_vertical"
            android:orientation="horizontal"
            app:layout_constraintTop_toBottomOf="@id/tvTitle"
            app:layout_constraintStart_toEndOf="@id/ivListingImage"
            app:layout_constraintEnd_toEndOf="parent">

            <ImageView
                android:layout_width="14dp"
                android:layout_height="14dp"
                android:contentDescription="@null"
                android:src="@drawable/ic_location_on_24"
                app:tint="@color/text_secondary" />

            <TextView
                android:id="@+id/tvLocation"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:layout_marginStart="4dp"
                android:textColor="@color/text_secondary"
                android:textSize="12sp"
                tools:text="بغداد · الكرخ" />

            <TextView
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:layout_marginStart="6dp"
                android:layout_marginEnd="6dp"
                android:text="·"
                android:textColor="@color/text_secondary" />

            <TextView
                android:id="@+id/tvTimeAgo"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:textColor="@color/text_secondary"
                android:textSize="12sp"
                tools:text="منذ ساعتين" />
        </LinearLayout>

        <!-- Price in Iraqi Dinars (د.ع) -->
        <TextView
            android:id="@+id/tvPrice"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:layout_marginStart="12dp"
            android:layout_marginTop="6dp"
            android:textColor="@color/eco_green"
            android:textSize="16sp"
            android:textStyle="bold"
            app:layout_constraintTop_toBottomOf="@id/layoutLocation"
            app:layout_constraintStart_toEndOf="@id/ivListingImage"
            tools:text="35,000 د.ع" />

        <!-- Quick Contact Action Buttons: Call & WhatsApp -->
        <LinearLayout
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:orientation="horizontal"
            android:gravity="center_vertical"
            app:layout_constraintBottom_toBottomOf="parent"
            app:layout_constraintEnd_toEndOf="parent">

            <!-- WhatsApp Direct Button -->
            <com.google.android.material.button.MaterialButton
                android:id="@+id/btnWhatsApp"
                style="@style/Widget.Material3.Button.TonalButton"
                android:layout_width="38dp"
                android:layout_height="38dp"
                android:layout_marginEnd="6dp"
                android:insetTop="0dp"
                android:insetBottom="0dp"
                android:padding="0dp"
                app:backgroundTint="@color/whatsapp_green_light"
                app:cornerRadius="19dp"
                app:icon="@drawable/ic_whatsapp_24"
                app:iconGravity="textStart"
                app:iconPadding="0dp"
                app:iconTint="@color/whatsapp_green" />

            <!-- Direct Call Button -->
            <com.google.android.material.button.MaterialButton
                android:id="@+id/btnCall"
                style="@style/Widget.Material3.Button"
                android:layout_width="wrap_content"
                android:layout_height="38dp"
                android:insetTop="0dp"
                android:insetBottom="0dp"
                android:paddingStart="12dp"
                android:paddingEnd="12dp"
                android:text="@string/btn_call"
                android:textColor="@color/card_white"
                android:textSize="12sp"
                android:textStyle="bold"
                app:backgroundTint="@color/eco_green"
                app:cornerRadius="19dp"
                app:icon="@drawable/ic_phone_24"
                app:iconGravity="textStart"
                app:iconPadding="4dp"
                app:iconTint="@color/card_white" />
        </LinearLayout>

    </androidx.constraintlayout.widget.ConstraintLayout>
</com.google.android.material.card.MaterialCardView>
`
  },
  {
    name: 'item_add_listing_cta.xml',
    path: 'res/layout/item_add_listing_cta.xml',
    language: 'xml',
    description: 'عنصر زر/بانر إضافة الإعلان البارز المتموضع مباشرة أسفل أول بطاقة إعلان في قائمة العرض الرأسية',
    code: `<?xml version="1.0" encoding="utf-8"?>
<!-- 
  سوق الدواجن والطيور العراقي - Prominent Inline "Add Listing" Button Layout
  Rendered directly underneath the first product item in the vertical feed
-->
<com.google.android.material.card.MaterialCardView 
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="wrap_content"
    android:layout_marginTop="4dp"
    android:layout_marginBottom="12dp"
    android:layoutDirection="rtl"
    android:textDirection="rtl"
    app:cardBackgroundColor="@color/eco_green"
    app:cardCornerRadius="18dp"
    app:cardElevation="4dp"
    app:strokeColor="@color/eco_green_dark"
    app:strokeWidth="1dp">

    <LinearLayout
        android:id="@+id/btnInlineAddListing"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:background="?attr/selectableItemBackground"
        android:clickable="true"
        android:focusable="true"
        android:gravity="center_vertical"
        android:orientation="horizontal"
        android:paddingStart="16dp"
        android:paddingEnd="16dp"
        android:paddingTop="12dp"
        android:paddingBottom="12dp">

        <!-- Circular Plus Icon Badge -->
        <FrameLayout
            android:layout_width="38dp"
            android:layout_height="38dp"
            android:background="@drawable/bg_circle_translucent"
            android:layout_marginEnd="12dp">

            <ImageView
                android:layout_width="22dp"
                android:layout_height="22dp"
                android:layout_gravity="center"
                android:src="@drawable/ic_add_24"
                app:tint="@color/card_white" />
        </FrameLayout>

        <!-- Bold Title & Arabic Subtitle -->
        <LinearLayout
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_weight="1"
            android:orientation="vertical">

            <TextView
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="@string/btn_add_ad"
                android:textColor="@color/card_white"
                android:textSize="16sp"
                android:textStyle="bold" />

            <TextView
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="@string/inline_cta_subtitle"
                android:textColor="@color/eco_green_light"
                android:textSize="12sp"
                android:maxLines="1"
                android:ellipsize="end" />
        </LinearLayout>

        <!-- White Pill Action Button ("أضف الآن") -->
        <com.google.android.material.button.MaterialButton
            android:id="@+id/btnPublishNow"
            style="@style/Widget.Material3.Button"
            android:layout_width="wrap_content"
            android:layout_height="36dp"
            android:insetTop="0dp"
            android:insetBottom="0dp"
            android:paddingStart="14dp"
            android:paddingEnd="14dp"
            android:text="@string/btn_publish_now"
            android:textColor="@color/eco_green"
            android:textSize="12sp"
            android:textStyle="bold"
            app:backgroundTint="@color/card_white"
            app:cornerRadius="18dp"
            app:elevation="1dp" />

    </LinearLayout>
</com.google.android.material.card.MaterialCardView>
`
  },
  {
    name: 'colors.xml',
    path: 'res/values/colors.xml',
    language: 'xml',
    description: 'لوحة الألوان المعتمدة (Eco-Green #27AE60 والرمادي الهادئ #F8F9FA والحاويات البيضاء)',
    code: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <!-- Brand Primary Palette -->
    <color name="eco_green">#27AE60</color>
    <color name="eco_green_dark">#219653</color>
    <color name="eco_green_light">#EAFBF1</color>
    
    <!-- Backgrounds & Surfaces -->
    <color name="bg_soft_gray">#F8F9FA</color>
    <color name="card_white">#FFFFFF</color>
    <color name="bg_input_field">#F1F3F5</color>
    <color name="bg_pill_inactive">#EEF2F6</color>
    
    <!-- Borders & Dividers -->
    <color name="border_hairline">#E5E7EB</color>
    <color name="divider_subtle">#F3F4F6</color>
    
    <!-- Typography & Icons -->
    <color name="text_primary">#1E293B</color>
    <color name="text_secondary">#64748B</color>
    <color name="text_hint">#94A3B8</color>
    
    <!-- Utility & Social -->
    <color name="whatsapp_green">#25D366</color>
    <color name="whatsapp_green_light">#E8F8EE</color>
    <color name="gold_badge">#D97706</color>
    <color name="error_red">#EF4444</color>
</resources>
`
  },
  {
    name: 'strings.xml',
    path: 'res/values/strings.xml',
    language: 'xml',
    description: 'النصوص العربية الخاصة بالتطبيق مع دعم كامل لمحاذاة اليمين إلى اليسار (RTL)',
    code: `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <!-- App Identity -->
    <string name="app_name">سوق الدواجن والطيور العراقي</string>
    <string name="app_tagline">منصة البيع والشراء الأولى في العراق</string>
    
    <!-- Header & Search -->
    <string name="search_hint">ابحث عن دجاج، زاجل، بلابل، أعلاف، علاجات...</string>
    <string name="selected_city_default">جميع المحافظات</string>
    <string name="change_city">تغيير المحافظة</string>
    
    <!-- Category Pills -->
    <string name="category_all">الكل</string>
    <string name="category_poultry">🐓 دواجن</string>
    <string name="category_birds">🕊️ طيور وحمام</string>
    <string name="category_feed">🌾 أعلاف ومستلزمات</string>
    <string name="category_vet">💊 أدوية وبيطرة</string>
    <string name="about_app">حول التطبيق</string>
    <string name="about_app_description">منصة عراقية متخصصة لبيع وشراء الدواجن، الطيور، الحمام الزاجل، الأعلاف والمستلزمات البيطرية في جميع محافظات العراق بسهولة ومباشرة بين البائع والمشتري بدون عمولة.</string>
    <string name="close">إغلاق</string>
    
    <!-- Navigation & Header -->
    <string name="desc_back">رجوع للخلف</string>
    
    <!-- Card & Actions -->
    <string name="badge_verified">موثوق</string>
    <string name="btn_call">اتصال</string>
    <string name="btn_whatsapp">واتساب</string>
    <string name="btn_add_ad">+ إضافة إعلان</string>
    <string name="btn_post_ad">نشر إعلان</string>
    <string name="btn_publish_featured">نشر وتثبيت مميز (مشاهدة فيديو مجاني) 🎬</string>
    <string name="btn_publish_normal">نشر عادي</string>
    <string name="currency_iqd">د.ع</string>
    <string name="desc_fav">إضافة للمفضلة</string>
    <string name="inline_cta_subtitle">انشر دواجنك أو طيورك أو أعلافك مجاناً وبدون عمولة</string>
    <string name="btn_publish_now">أضف الآن</string>
    <string name="admob_placeholder_text">Google AdMob Banner (320x50 Adaptive)</string>
    
    <!-- Bottom Navigation -->
    <string name="nav_home">الرئيسية</string>
    <string name="nav_favorites">المفضلة</string>
    <string name="nav_my_ads">إعلاناتي</string>
    <string name="nav_chat">المحادثات</string>
    <string name="nav_profile">حسابي</string>
</resources>
`
  },
  {
    name: 'bg_pill_active.xml',
    path: 'res/drawable/bg_pill_active.xml',
    language: 'xml',
    description: 'خلفية الزر المفعل باللون الأخضر المتناسق (#27AE60) مع زوايا بيضاوية',
    code: `<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android"
    android:shape="rectangle">
    <solid android:color="@color/eco_green" />
    <corners android:radius="24dp" />
    <padding
        android:left="16dp"
        android:top="8dp"
        android:right="16dp"
        android:bottom="8dp" />
</shape>
`
  },
  {
    name: 'bg_pill_inactive.xml',
    path: 'res/drawable/bg_pill_inactive.xml',
    language: 'xml',
    description: 'خلفية الأزرار غير المفعلة بالرمادي الهادئ (#EEF2F6)',
    code: `<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android"
    android:shape="rectangle">
    <solid android:color="@color/bg_pill_inactive" />
    <corners android:radius="24dp" />
    <stroke
        android:width="1dp"
        android:color="@color/border_hairline" />
    <padding
        android:left="16dp"
        android:top="8dp"
        android:right="16dp"
        android:bottom="8dp" />
</shape>
`
  },
  {
    name: 'MainActivity.kt',
    path: 'app/src/main/java/iq/poultry/market/MainActivity.kt',
    language: 'kotlin',
    description: 'كود Kotlin الرئيسي مع منطق الإخفاء/الإظهار الديناميكي لسلايدر البنر (View.GONE) وجلب البيانات من Google Sheets والبحث والتصنيفات',
    code: `package iq.poultry.market

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.text.Editable
import android.text.TextWatcher
import android.util.Log
import android.view.View
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.viewpager2.widget.ViewPager2
import com.google.android.material.button.MaterialButton
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.google.android.material.tabs.TabLayoutMediator
import iq.poultry.market.databinding.ActivityHomeBinding
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

/**
 * نموذج بيانات البنر المجلوب من شيت "إعلانات البنر"
 */
data class BannerItem(
    val id: String,
    val title: String,
    val subtitle: String?,
    val imageUrl: String,
    val linkUrl: String?,
    val badgeText: String?,
    val isActive: Boolean
)

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityHomeBinding
    private lateinit var adapter: ListingsAdapter
    private var bannerAdapter: BannersAdapter? = null

    // مؤقت التمرير التلقائي لسلايدر البنر (Auto-scroll)
    private val bannerHandler = Handler(Looper.getMainLooper())
    private var bannerAutoScrollRunnable: Runnable? = null
    private var activeBannersCount = 0

    // رابط Google Apps Script المربوط مع جدول Google Sheets
    private val GOOGLE_SHEETS_SCRIPT_URL = 
        "https://script.google.com/macros/s/AKfycbz4zqsfEDYc8JEGgoVpg4dPFv8v8jIZx2LFg6a2RLuUmT8pfVCqrtP-Nrm08CBHGare/exec"

    private var selectedCategory: String = "all"
    private var selectedGovernorate: String = "جميع المحافظات"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityHomeBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupRecyclerView()
        setupCategoryPills()
        setupAboutAppButton()
        setupSearchAndCityFilter()

        // 1. عند تشغيل الشاشة الرئيسية: جلب قائمة البنرات النشطة من شيت "إعلانات البنر"
        fetchActiveBannersFromGoogleSheets()
    }

    /**
     * 1. جلب قائمة إعلانات البنر النشطة من Google Sheets backend ("إعلانات البنر" sheet)
     */
    private fun fetchActiveBannersFromGoogleSheets() {
        lifecycleScope.launch {
            try {
                val banners = withContext(Dispatchers.IO) {
                    loadBannersFromSheetApi(GOOGLE_SHEETS_SCRIPT_URL)
                }
                // 2. تطبيق شرط الظهور الديناميكي بحسب حجم القائمة
                updateBannerSliderVisibility(banners)
            } catch (e: Exception) {
                Log.e("MainActivity", "خطأ أثناء جلب البنرات: \${e.message}", e)
                // في حالة انقطاع الإنترنت أو الخطأ، إخفاء الحاوية تماماً لمنع ظهور أي فراغ فارغ
                updateBannerSliderVisibility(null)
            }
        }
    }

    /**
     * 2. شرط الظهور الديناميكي لسلايدر البنر (Dynamic Visibility Condition):
     *
     * - إذا كانت قائمة البنرات النشطة فارغة (size == 0) أو null:
     *   يتم إخفاء حاوية ViewPager2 بالكامل بتعيين visibility إلى View.GONE لمنع أي مساحة بيضاء أو فراغ.
     *
     * - إذا كانت هناك بنرات نشطة (size > 0):
     *   يتم تعيين visibility إلى View.VISIBLE، وربط الـ Adapter، وتشغيل العرض والتمرير التلقائي.
     */
    private fun updateBannerSliderVisibility(banners: List<BannerItem>?) {
        if (banners.isNullOrEmpty()) {
            // [الحالة 1: فارغة أو null]
            // إخفاء الحاوية بالكامل (View.GONE) -> لا يتبقى أي ارتفاع أو فراغ في الواجهة
            binding.bannerSliderContainer.visibility = View.GONE
            stopBannerAutoScroll()
            activeBannersCount = 0
            Log.d("MainActivity", "قائمة البنرات فارغة (size == 0) -> تم تفعيل View.GONE")
        } else {
            // [الحالة 2: يوجد بنرات نشطة (size > 0)]
            // إظهار الحاوية (View.VISIBLE)، ربط الـ Adapter، وبدء السلايدر التلقائي
            binding.bannerSliderContainer.visibility = View.VISIBLE
            activeBannersCount = banners.size

            setupBannerViewPager(banners)
            startBannerAutoScroll(banners.size)
            Log.d("MainActivity", "تم جلب \${banners.size} بنرات نشطة -> تم تفعيل View.VISIBLE")
        }
    }

    /**
     * ربط ViewPager2 مع BannersAdapter ومؤشر النقاط TabLayout
     */
    private fun setupBannerViewPager(banners: List<BannerItem>) {
        bannerAdapter = BannersAdapter(banners) { banner ->
            // عند النقر على البنر: فتح الرابط أو العرض الخاص
            Log.d("MainActivity", "تم النقر على البنر: \${banner.title}")
        }
        binding.bannerViewPager.adapter = bannerAdapter

        // ربط مؤشر النقاط TabLayout مع ViewPager2
        TabLayoutMediator(binding.bannerDotsIndicator, binding.bannerViewPager) { _, _ ->
            // تصميم النقطة محدد في selector_banner_dot.xml
        }.attach()

        // إيقاف التمرير التلقائي أثناء سحب المستخدم باللمس، واستئنافه عند التوقف
        binding.bannerViewPager.registerOnPageChangeCallback(object : ViewPager2.OnPageChangeCallback() {
            override fun onPageScrollStateChanged(state: Int) {
                super.onPageScrollStateChanged(state)
                if (state == ViewPager2.SCROLL_STATE_DRAGGING) {
                    stopBannerAutoScroll()
                } else if (state == ViewPager2.SCROLL_STATE_IDLE) {
                    startBannerAutoScroll(activeBannersCount)
                }
            }
        })
    }

    /**
     * بدء التمرير التلقائي للسلايدر كل 4 ثوانٍ
     */
    private fun startBannerAutoScroll(itemCount: Int) {
        stopBannerAutoScroll()
        if (itemCount <= 1) return

        bannerAutoScrollRunnable = object : Runnable {
            override fun run() {
                val currentItem = binding.bannerViewPager.currentItem
                val nextItem = if (currentItem + 1 >= itemCount) 0 else currentItem + 1
                binding.bannerViewPager.setCurrentItem(nextItem, true)
                bannerHandler.postDelayed(this, 4000)
            }
        }
        bannerHandler.postDelayed(bannerAutoScrollRunnable!!, 4000)
    }

    /**
     * إيقاف مؤقت التمرير التلقائي لتجنب تسريب الذاكرة
     */
    private fun stopBannerAutoScroll() {
        bannerAutoScrollRunnable?.let {
            bannerHandler.removeCallbacks(it)
            bannerAutoScrollRunnable = null
        }
    }

    /**
     * الاتصال بـ Google Apps Script لقراءة بيانات شيت "إعلانات البنر"
     */
    private fun loadBannersFromSheetApi(apiUrl: String): List<BannerItem> {
        val url = URL("\$apiUrl?action=getBanners")
        val conn = url.openConnection() as HttpURLConnection
        conn.requestMethod = "GET"
        conn.connectTimeout = 8000
        conn.readTimeout = 8000

        if (conn.responseCode != 200) {
            return emptyList()
        }

        val jsonResponse = conn.inputStream.bufferedReader().use { it.readText() }
        val root = JSONObject(jsonResponse)
        if (!root.optBoolean("success", false)) {
            return emptyList()
        }

        val bannersArray = root.optJSONArray("banners") ?: return emptyList()
        val result = mutableListOf<BannerItem>()

        for (i in 0 until bannersArray.length()) {
            val item = bannersArray.getJSONObject(i)
            val isActive = item.optBoolean("isActive", true)
            if (isActive) {
                result.add(
                    BannerItem(
                        id = item.optString("id", "banner-\$i"),
                        title = item.optString("title", ""),
                        subtitle = item.optString("subtitle", null),
                        imageUrl = item.optString("imageUrl", ""),
                        linkUrl = item.optString("linkUrl", null),
                        badgeText = item.optString("badgeText", "إعلان مميز"),
                        isActive = true
                    )
                )
            }
        }
        return result
    }

    private fun openCreateListingDialog() {
        // فتح نافذة نشر إعلان جديد
    }

    private fun setupRecyclerView() {
        adapter = ListingsAdapter(
            onItemClick = { listing ->
                // فتح تفاصيل الإعلان
            },
            onAddListingClick = {
                // النقر على زر "+ إضافة إعلان" البارز أسفل أول بطاقة
                openCreateListingDialog()
            }
        )
        binding.rvListings.apply {
            layoutManager = LinearLayoutManager(this@MainActivity)
            adapter = this@MainActivity.adapter
        }
    }

    private fun setupCategoryPills() {
        val pills = listOf(
            binding.pillCategoryAll to "all",
            binding.pillCategoryPoultry to "poultry",
            binding.pillCategoryBirds to "birds",
            binding.pillCategoryFeed to "feed",
            binding.pillCategoryVet to "vet"
        )

        pills.forEach { (button, catId) ->
            button.setOnClickListener {
                updatePillStates(button)
                selectedCategory = catId
                filterListings()
            }
        }
    }

    private fun updatePillStates(activeButton: MaterialButton) {
        val allButtons = listOf(
            binding.pillCategoryAll,
            binding.pillCategoryPoultry,
            binding.pillCategoryBirds,
            binding.pillCategoryFeed,
            binding.pillCategoryVet
        )

        allButtons.forEach { btn ->
            if (btn == activeButton) {
                btn.setBackgroundColor(getColor(R.color.eco_green))
                btn.setTextColor(getColor(R.color.card_white))
            } else {
                btn.setBackgroundColor(getColor(R.color.bg_pill_inactive))
                btn.setTextColor(getColor(R.color.text_primary))
            }
        }
    }

    private fun setupSearchAndCityFilter() {
        binding.etSearchInput.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                filterListings(s.toString())
            }
            override fun afterTextChanged(s: Editable?) {}
        })

        binding.btnCityFilter.setOnClickListener {
            showCitySelectionDialog()
        }
    }

    private fun showCitySelectionDialog() {
        // عرض قائمة المحافظات العراقية
    }

    private fun setupAboutAppButton() {
        binding.btnAboutApp.setOnClickListener {
            fetchAndShowAboutDialog()
        }
    }

    /**
     * جلب حقلي (version و contact) تلقائياً وبشكل حي من رابط الـ API التالي بصيغة JSON،
     * مع مؤشر تحميل وقيم احتياطية افتراضية في حال عدم توفر الإنترنت
     */
    private fun fetchAndShowAboutDialog() {
        val aboutApiUrl =
            "https://script.google.com/macros/s/AKfycbx1455M9KUfCL68_1pqlBrekGbVJwCnBL3DNvWC_xhjfY2neJ1uh2kio-Y8MFb9wH6c6A/exec"
        val staticAboutText = getString(R.string.about_app_description)
        val fallbackVersion = "1.0.0"
        val fallbackContact = "alimohammed@gmail.com"

        val loadingDialog = MaterialAlertDialogBuilder(this@MainActivity)
            .setTitle(getString(R.string.about_app))
            .setMessage("جاري التحديث...")
            .setCancelable(false)
            .show()

        lifecycleScope.launch {
            var version = fallbackVersion
            var contact = fallbackContact

            try {
                val json = withContext(Dispatchers.IO) {
                    val conn = URL(aboutApiUrl).openConnection() as HttpURLConnection
                    conn.requestMethod = "GET"
                    conn.instanceFollowRedirects = true
                    conn.connectTimeout = 8000
                    conn.readTimeout = 8000
                    val body = conn.inputStream.bufferedReader().use { it.readText() }
                    JSONObject(body)
                }

                val fetchedVersion = json.optString("version", "").trim()
                val fetchedContact = json.optString("contact", "").trim()
                if (fetchedVersion.isNotEmpty()) version = fetchedVersion
                if (fetchedContact.isNotEmpty()) contact = fetchedContact
            } catch (e: Exception) {
                Log.e("MainActivity", "تعذر جلب البيانات الحية، تم استخدام القيم الافتراضية: \${e.message}", e)
            } finally {
                loadingDialog.dismiss()
            }

            MaterialAlertDialogBuilder(this@MainActivity)
                .setTitle(getString(R.string.about_app))
                .setMessage(
                    "نبذة عن التطبيق:\n$staticAboutText\n\n" +
                    "إصدار التطبيق الحالي: v$version\n" +
                    "التواصل: $contact"
                )
                .setPositiveButton(getString(R.string.close)) { dialog, _ ->
                    dialog.dismiss()
                }
                .setNeutralButton("تواصل الآن") { _, _ ->
                    val intentUri = when {
                        contact.contains("@") && !contact.startsWith("http") ->
                            Uri.parse("mailto:$contact")
                        contact.startsWith("http") ->
                            Uri.parse(contact)
                        contact.all { it.isDigit() || it == '+' } ->
                            Uri.parse("tel:$contact")
                        else ->
                            Uri.parse("https://$contact")
                    }
                    startActivity(Intent(Intent.ACTION_VIEW, intentUri))
                }
                .show()
        }
    }

    private fun filterListings(query: String = binding.etSearchInput.text.toString()) {
        // تصفية الإعلانات
    }

    override fun onDestroy() {
        super.onDestroy()
        stopBannerAutoScroll()
    }
}
`
  },
  {
    name: 'AndroidManifest.xml',
    path: 'AndroidManifest.xml',
    language: 'xml',
    description: 'ملف بيان التطبيق مع تفعيل دعم RTL الكامل في نظام أندرويد',
    code: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="iq.poultry.market">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.CALL_PHONE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.IraqiPoultryMarket">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:screenOrientation="portrait">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>
`
  },
  {
    name: 'ListingDetailsActivity.kt',
    path: 'app/src/main/java/iq/poultry/market/ListingDetailsActivity.kt',
    language: 'kotlin',
    description: 'شاشة تفاصيل الإعلان مع منطق التحقق من رقم هاتف الناشر وزر الحذف الأحمر وتأكيد الحذف وحذف الإعلان من Google Sheets',
    code: `package iq.poultry.market

import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import iq.poultry.market.databinding.ActivityListingDetailsBinding
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLEncoder

/**
 * شاشة تفاصيل الإعلان - تتضمن منطق أمان حذف الإعلان:
 * 1. فحص رقم هاتف المستخدم المسجل ومقارنته برقم هاتف صاحب الإعلان بعد توحيد الصيغة العراقية.
 * 2. إظهار زر "حذف الإعلان" الأحمر فقط في حال تطابق الرقمين.
 * 3. عرض نافذة تأكيد للمستخدم قبل الحذف.
 * 4. إرسال طلب حذف إلى Google Apps Script لحذف السطر من جدول بيانات Google Sheet.
 */
class ListingDetailsActivity : AppCompatActivity() {

    private lateinit var binding: ActivityListingDetailsBinding

    // يمكن جلب رقم هاتف المستخدم الحالي من SharedPreferences أو Firebase Auth
    private val currentUserPhone: String = "07701234567"

    // رابط Google Apps Script الخاص بك
    private val googleAppsScriptUrl: String = "https://script.google.com/macros/s/AKfycbyPoultryAppScript/exec"

    private var listingId: String = ""
    private var listingPhone: String = ""

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityListingDetailsBinding.inflate(layoutInflater)
        setContentView(binding.root)

        listingId = intent.getStringExtra("EXTRA_LISTING_ID") ?: ""
        listingPhone = intent.getStringExtra("EXTRA_LISTING_PHONE") ?: ""

        setupListingData()
        checkDeletePermission()
    }

    /**
     * دالة توحيد وتنسيق رقم الهاتف العراقي لمطابقة الأرقام بدقة
     * تدعم الصيغ: +9647701234567, 009647701234567, 07701234567, 7701234567
     */
    private fun normalizeIraqiPhone(phone: String?): String {
        if (phone.isNullOrBlank()) return ""
        var cleaned = phone.replace(Regex("[^0-9]"), "")
        if (cleaned.startsWith("00964")) cleaned = cleaned.removePrefix("00964")
        if (cleaned.startsWith("964")) cleaned = cleaned.removePrefix("964")
        if (cleaned.startsWith("0")) cleaned = cleaned.removePrefix("0")
        return cleaned
    }

    /**
     * فحص ما إذا كان المستخدم الحالي هو ناشر الإعلان
     */
    private fun isListingOwner(): Boolean {
        val normUser = normalizeIraqiPhone(currentUserPhone)
        val normListing = normalizeIraqiPhone(listingPhone)
        return normUser.isNotEmpty() && normUser == normListing
    }

    private fun checkDeletePermission() {
        if (isListingOwner()) {
            // إظهار زر الحذف الأحمر للمالك فقط
            binding.btnDeleteListing.visibility = View.VISIBLE
            binding.btnDeleteListing.setOnClickListener {
                showDeleteConfirmationDialog()
            }
        } else {
            // إخفاء الزر إذا لم يكن المستخدم هو الناشر
            binding.btnDeleteListing.visibility = View.GONE
        }
    }

    /**
     * نافذة تأكيد الحذف
     */
    private fun showDeleteConfirmationDialog() {
        MaterialAlertDialogBuilder(this)
            .setTitle("تأكيد حذف الإعلان")
            .setMessage("هل أنت متأكد من رغبتك في حذف هذا الإعلان نهائياً من سوق الدواجن؟ لن تتمكن من التراجع عن هذه الخطوة.")
            .setPositiveButton("نعم، احذف الإعلان") { _, _ ->
                deleteListingFromGoogleSheet(listingId)
            }
            .setNegativeButton("إلغاء", null)
            .show()
    }

    /**
     * إرسال طلب الحذف إلى Google Apps Script
     */
    private fun deleteListingFromGoogleSheet(adId: String) {
        binding.progressBar.visibility = View.VISIBLE
        binding.btnDeleteListing.isEnabled = false

        CoroutineScope(Dispatchers.IO).launch {
            try {
                val url = URL(googleAppsScriptUrl)
                val conn = url.openConnection() as HttpURLConnection
                conn.requestMethod = "POST"
                conn.doOutput = true
                conn.setRequestProperty("Content-Type", "application/x-www-form-urlencoded")

                val postData = "action=" + URLEncoder.encode("delete", "UTF-8") +
                               "&adId=" + URLEncoder.encode(adId, "UTF-8") +
                               "&phone=" + URLEncoder.encode(currentUserPhone, "UTF-8")

                conn.outputStream.use { os ->
                    os.write(postData.toByteArray())
                }

                val responseCode = conn.responseCode
                val responseBody = conn.inputStream.bufferedReader().use { it.readText() }

                withContext(Dispatchers.Main) {
                    binding.progressBar.visibility = View.GONE
                    if (responseCode == 200) {
                        Toast.makeText(this@ListingDetailsActivity, "تم حذف الإعلان بنجاح", Toast.LENGTH_LONG).show()
                        setResult(RESULT_OK)
                        finish() // العودة إلى القائمة الرئيسية
                    } else {
                        Toast.makeText(this@ListingDetailsActivity, "تعذر الحذف، يرجى المحاولة لاحقاً", Toast.LENGTH_SHORT).show()
                        binding.btnDeleteListing.isEnabled = true
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    binding.progressBar.visibility = View.GONE
                    binding.btnDeleteListing.isEnabled = true
                    Toast.makeText(this@ListingDetailsActivity, "خطأ بالاتصال: \${e.localizedMessage}", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    private fun setupListingData() {
        // تعبئة بيانات الإعلان في الحقول
    }
}
`
  },
  {
    name: 'item_banner_slide.xml',
    path: 'res/layout/item_banner_slide.xml',
    language: 'xml',
    description: 'تصميم عنصر شريحة البنر داخل ViewPager2 مع صورة الخلفية وتدرج التباين والنصوص والشارة',
    code: `<?xml version="1.0" encoding="utf-8"?>
<androidx.constraintlayout.widget.ConstraintLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent">

    <!-- Background Image -->
    <ImageView
        android:id="@+id/ivBannerImage"
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        android:scaleType="centerCrop"
        android:contentDescription="@null"
        tools:src="@tools:sample/backgrounds/scenic" />

    <!-- Dark Gradient Overlay for readability -->
    <View
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        android:background="#99000000" />

    <!-- Badge Tag (e.g. مهرجان حصري, خصم خاص) -->
    <TextView
        android:id="@+id/tvBannerBadge"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_marginStart="14dp"
        android:layout_marginTop="14dp"
        android:background="@drawable/bg_banner_badge"
        android:paddingHorizontal="10dp"
        android:paddingVertical="4dp"
        android:textColor="@color/card_white"
        android:textSize="11sp"
        android:textStyle="bold"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintTop_toTopOf="parent"
        tools:text="إعلان مُميز" />

    <!-- Banner Title -->
    <TextView
        android:id="@+id/tvBannerTitle"
        android:layout_width="0dp"
        android:layout_height="wrap_content"
        android:layout_marginStart="14dp"
        android:layout_marginEnd="14dp"
        android:layout_marginBottom="4dp"
        android:ellipsize="end"
        android:maxLines="2"
        android:textColor="@color/card_white"
        android:textSize="15sp"
        android:textStyle="bold"
        app:layout_constraintBottom_toTopOf="@id/tvBannerSubtitle"
        app:layout_constraintEnd_toEndOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        tools:text="مهرجان بغداد السنوي لطيور الزينة والحمام الزاجل" />

    <!-- Banner Subtitle -->
    <TextView
        android:id="@+id/tvBannerSubtitle"
        android:layout_width="0dp"
        android:layout_height="wrap_content"
        android:layout_marginStart="14dp"
        android:layout_marginEnd="14dp"
        android:layout_marginBottom="28dp"
        android:ellipsize="end"
        android:maxLines="1"
        android:textColor="#E0E0E0"
        android:textSize="12sp"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintEnd_toEndOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        tools:text="معرض ومزاد فوري لأندر سلالات الطيور - جوائز ومسابقات كبرى" />

</androidx.constraintlayout.widget.ConstraintLayout>
`
  },
  {
    name: 'selector_banner_dot.xml',
    path: 'res/drawable/selector_banner_dot.xml',
    language: 'xml',
    description: 'محدد مظهر نقطة مؤشر سلايدر البنر (نقطة خضراء عريضة عند التحديد، ونقطة رمادية صغيرة عند عدم التحديد)',
    code: `<?xml version="1.0" encoding="utf-8"?>
<selector xmlns:android="http://schemas.android.com/apk/res/android">
    <!-- Active Selected Tab Dot: Wide Green Pill -->
    <item android:state_selected="true">
        <shape android:shape="rectangle">
            <size android:width="20dp" android:height="6dp" />
            <solid android:color="@color/eco_green" />
            <corners android:radius="3dp" />
        </shape>
    </item>
    <!-- Inactive Tab Dot: Small Circle -->
    <item>
        <shape android:shape="rectangle">
            <size android:width="6dp" android:height="6dp" />
            <solid android:color="#80FFFFFF" />
            <corners android:radius="3dp" />
        </shape>
    </item>
</selector>
`
  },
  {
    name: 'BannersAdapter.kt',
    path: 'app/src/main/java/iq/poultry/market/BannersAdapter.kt',
    language: 'kotlin',
    description: 'محول ViewPager2 لعرض شرائح البنر مع تحميل الصور ومعالجة النقر',
    code: `package iq.poultry.market

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import iq.poultry.market.databinding.ItemBannerSlideBinding

class BannersAdapter(
    private val banners: List<BannerItem>,
    private val onBannerClick: (BannerItem) -> Unit
) : RecyclerView.Adapter<BannersAdapter.BannerViewHolder>() {

    inner class BannerViewHolder(val binding: ItemBannerSlideBinding) :
        RecyclerView.ViewHolder(binding.root)

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): BannerViewHolder {
        val binding = ItemBannerSlideBinding.inflate(
            LayoutInflater.from(parent.context), parent, false
        )
        return BannerViewHolder(binding)
    }

    override fun onBindViewHolder(holder: BannerViewHolder, position: Int) {
        val banner = banners[position]
        with(holder.binding) {
            tvBannerTitle.text = banner.title
            
            if (!banner.subtitle.isNullOrBlank()) {
                tvBannerSubtitle.visibility = View.VISIBLE
                tvBannerSubtitle.text = banner.subtitle
            } else {
                tvBannerSubtitle.visibility = View.GONE
            }

            if (!banner.badgeText.isNullOrBlank()) {
                tvBannerBadge.visibility = View.VISIBLE
                tvBannerBadge.text = banner.badgeText
            } else {
                tvBannerBadge.visibility = View.GONE
            }

            // تحميل صورة البنر بواسطة Glide
            Glide.with(ivBannerImage.context)
                .load(banner.imageUrl)
                .centerCrop()
                .into(ivBannerImage)

            root.setOnClickListener {
                onBannerClick(banner)
            }
        }
    }

    override fun getItemCount(): Int = banners.size
}
`
  },
  {
    name: 'GoogleAppsScript_Code.gs',
    path: 'backend/GoogleAppsScript_Code.gs',
    language: 'javascript',
    description: 'كود Google Apps Script المربوط مع جداول Google Sheet (يشمل جلب إعلانات البنر، حذف الإعلانات، وجلب إعلانات السوق)',
    code: `/**
 * Google Apps Script - سوق الدواجن والطيور العراقي
 * هذا السكربت يتم نشره كـ Web App بصلاحية "Anyone" لربط تطبيق الأندرويد مع Google Sheets.
 */

const SHEET_LISTINGS = "الإعلانات";
const SHEET_BANNERS = "إعلانات البنر";
const DRIVE_VIDEO_FOLDER_NAME = "فيديوهات سوق الدواجن والطيور العراقي";

function doPost(e) {
  try {
    const params = e.parameter || {};
    const postData = e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {};
    
    const action = params.action || postData.action || "";
    const adId = params.adId || postData.adId || "";
    const phone = params.phone || postData.phone || "";

    // 1. رفع فيديو الإعلان إلى Google Drive وإرجاع رابط عام مباشر
    if (action === "uploadVideo") {
      return handleUploadVideo(postData);
    }

    // 2. منطق حذف الإعلان (Delete Listing)
    if (action === "delete" || action === "deleteListing") {
      return handleDeleteListing(adId, phone);
    }

    // 3. منطق إضافة إعلان جديد (Create Listing)
    if (action === "create" || action === "addListing" || postData.title) {
      return handleAddListing(postData.title ? postData : params);
    }

    return createJsonResponse({ success: false, error: "إجراء غير معروف: " + action });
  } catch (err) {
    return createJsonResponse({ success: false, error: err.toString() });
  }
}

function doGet(e) {
  const params = e.parameter || {};
  const action = params.action || "";

  // 1. جلب إعلانات البنر لشاشة التطبيق الرئيسية ("إعلانات البنر" sheet)
  if (action === "getBanners" || action === "banners") {
    return handleGetActiveBanners();
  }

  // 2. دعم الحذف عبر GET
  if (action === "delete") {
    return handleDeleteListing(params.adId, params.phone);
  }

  // 3. جلب كل إعلانات السوق
  return handleGetListings();
}

/**
 * جلب قائمة البنرات النشطة من شيت "إعلانات البنر"
 * إذا كان الشيت فارغاً أو لا توجد بنرات نشطة، يُرجع مصفوفة فارغة []
 * ليقوم تطبيق أندرويد بتطبيق شرط View.GONE تلقائياً.
 */
function handleGetActiveBanners() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_BANNERS);
  
  if (!sheet) {
    return createJsonResponse({ success: true, banners: [] });
  }

  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    return createJsonResponse({ success: true, banners: [] });
  }

  const header = data[0].map(h => String(h).trim().toLowerCase());
  const idCol = header.findIndex(h => /id|معرف|كود/i.test(h));
  const titleCol = header.findIndex(h => /عنوان|title/i.test(h));
  const subtitleCol = header.findIndex(h => /فرعي|subtitle|وصف/i.test(h));
  const imageCol = header.findIndex(h => /صورة|image|url/i.test(h));
  const linkCol = header.findIndex(h => /رابط|link/i.test(h));
  const badgeCol = header.findIndex(h => /شارة|badge|نوع/i.test(h));
  const statusCol = header.findIndex(h => /حالة|status|نشط|active/i.test(h));

  const activeBanners = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const statusVal = statusCol !== -1 ? String(row[statusCol]).trim() : "نشط";
    const isActive = statusVal === "نشط" || statusVal === "active" || statusVal === "TRUE" || statusVal === "1";

    if (isActive) {
      activeBanners.push({
        id: idCol !== -1 && row[idCol] ? String(row[idCol]) : ("banner-" + i),
        title: titleCol !== -1 ? String(row[titleCol]) : "إعلان ترويجي",
        subtitle: subtitleCol !== -1 ? String(row[subtitleCol]) : "",
        imageUrl: imageCol !== -1 ? String(row[imageCol]) : "",
        linkUrl: linkCol !== -1 ? String(row[linkCol]) : "",
        badgeText: badgeCol !== -1 && row[badgeCol] ? String(row[badgeCol]) : "إعلان مُميز",
        isActive: true
      });
    }
  }

  return createJsonResponse({
    success: true,
    banners: activeBanners,
    count: activeBanners.length
  });
}

/**
 * معالجة حذف الإعلان من Google Sheet بالاعتماد على Ad ID
 */
function handleDeleteListing(adId, requesterPhone) {
  if (!adId) {
    return createJsonResponse({ success: false, error: "معرف الإعلان مفقود" });
  }

  const sheet = getListingsSheet();
  const data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) {
    return createJsonResponse({ success: false, error: "لا توجد إعلانات مسجلة" });
  }

  const header = data[0];
  const idColIndex = header.findIndex(h => /id|معرف|كود/i.test(h)) !== -1 
                     ? header.findIndex(h => /id|معرف|كود/i.test(h)) : 0;
  
  let targetRowIndex = -1;

  for (let i = 1; i < data.length; i++) {
    const rowId = String(data[i][idColIndex]).trim();
    if (rowId === String(adId).trim()) {
      targetRowIndex = i + 1; // 1-based index في Sheets
      break;
    }
  }

  if (targetRowIndex === -1) {
    return createJsonResponse({ 
      success: false, 
      error: "لم يتم العثور على الإعلان بالمعرف: " + adId 
    });
  }

  // حذف السطر نهائياً
  sheet.deleteRow(targetRowIndex);

  return createJsonResponse({
    success: true,
    message: "تم حذف الإعلان بنجاح من جدول البيانات",
    adId: adId
  });
}

function handleGetListings() {
  const sheet = getListingsSheet();
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return createJsonResponse({ success: true, listings: [] });

  const headers = data[0];
  const listings = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const item = {};
    headers.forEach((h, idx) => {
      item[h] = row[idx];
    });
    listings.push(item);
  }
  return createJsonResponse({ success: true, listings: listings });
}

/**
 * استقبال الفيديو بصيغة Base64 وحفظه في مجلد Google Drive وجعله عاماً (Public)
 * ثم إرجاع رابط الرؤية المباشر لحفظه في عمود video وتشغيله داخل التطبيق
 */
function handleUploadVideo(data) {
  const base64Raw = String(data.base64Data || "").replace(/^data:[^;]+;base64,/, "");
  if (!base64Raw) {
    return createJsonResponse({ success: false, error: "بيانات الفيديو (base64Data) مفقودة" });
  }

  const mimeType = String(data.mimeType || "video/mp4");
  const fileName = String(data.fileName || ("poultry-ad-" + new Date().getTime() + ".mp4"));
  const decodedBytes = Utilities.base64Decode(base64Raw);
  const blob = Utilities.newBlob(decodedBytes, mimeType, fileName);

  const folder = getOrCreateVideoFolder();
  const file = folder.createFile(blob);

  // جعل صلاحيات الفيديو عامة للقراءة (أي شخص لديه الرابط)
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  const fileId = file.getId();
  const previewUrl = "https://drive.google.com/file/d/" + fileId + "/preview";
  const viewUrl = "https://drive.google.com/file/d/" + fileId + "/view";
  const directUrl = "https://drive.google.com/uc?export=download&id=" + fileId;

  return createJsonResponse({
    success: true,
    fileId: fileId,
    videoUrl: previewUrl,
    previewUrl: previewUrl,
    viewUrl: viewUrl,
    directUrl: directUrl
  });
}

function getOrCreateVideoFolder() {
  const folders = DriveApp.getFoldersByName(DRIVE_VIDEO_FOLDER_NAME);
  if (folders.hasNext()) {
    return folders.next();
  }
  return DriveApp.createFolder(DRIVE_VIDEO_FOLDER_NAME);
}

/**
 * إضافة إعلان جديد وحفظه في Google Sheet مع حالة التثبيت المميز (is_pinned)
 * وأعمدة الصور (images) والفيديو (video) المرسلة عبر doPost
 */
function handleAddListing(data) {
  const sheet = getListingsSheet();
  const id = new Date().getTime();
  const dateStr = new Date().toISOString();
  const isPinned = Boolean(
    data["is-pinned"] === true ||
    data.is_pinned === true ||
    data.is_featured === true ||
    String(data.is_featured || data.is_pinned) === "true"
  );

  // معالجة مصفوفة الصور (حد أقصى 8 صور، الأولى غلاف الإعلان) والفيديو
  let imagesValue = "";
  if (Array.isArray(data.images)) {
    imagesValue = data.images.slice(0, 8).join(",");
  } else if (typeof data.images === "string") {
    imagesValue = data.images;
  }

  let videoValue = data.video ? String(data.video) : "";
  if (!videoValue && data.videoBase64) {
    const uploadRes = JSON.parse(
      handleUploadVideo({
        base64Data: data.videoBase64,
        mimeType: data.videoMimeType || "video/mp4",
        fileName: data.videoFileName || ("ad-" + id + ".mp4")
      }).getContent()
    );
    if (uploadRes.success && uploadRes.videoUrl) {
      videoValue = uploadRes.videoUrl;
    }
  }

  sheet.appendRow([
    id,
    data.title || "إعلان دواجن أو طيور",
    data.category || "poultry",
    Number(data.price) || 0,
    data.governorate || data.city || "بغداد",
    data.district || "المركز",
    data["seller-name"] || data.seller_name || data.sellerName || "بدون اسم",
    data.phone || "",
    data.description || "",
    imagesValue, // عمود الصور (images)
    videoValue,  // عمود الفيديو (video)
    isPinned,
    dateStr
  ]);

  return createJsonResponse({
    success: true,
    message: isPinned ? "تم نشر الإعلان وتثبيته في صدارة السوق بنجاح" : "تم نشر الإعلان بنجاح",
    adId: id,
    is_pinned: isPinned,
    images: imagesValue,
    video: videoValue
  });
}

function getListingsSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_LISTINGS);
  if (!sheet) {
    sheet = ss.getSheets()[0];
  }
  return sheet;
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
`
  },
  {
    name: 'PublishActivity.kt',
    path: 'app/src/main/java/iq/poultry/market/PublishActivity.kt',
    language: 'kotlin',
    description: 'شاشة نشر الإعلان مع ميزة التثبيت والتمييز عبر إعلان المكافأة من AdMob (RewardedAd ca-app-pub-3940256099942544/5224354917) وزر النشر العادي',
    code: `package iq.poultry.market

import android.app.Activity
import android.media.MediaMetadataRetriever
import android.net.Uri
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.Button
import android.widget.Toast
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import com.google.android.gms.ads.AdError
import com.google.android.gms.ads.AdRequest
import com.google.android.gms.ads.LoadAdError
import com.google.android.gms.ads.rewarded.RewardedAd
import com.google.android.gms.ads.rewarded.RewardedAdLoadCallback
import iq.poultry.market.databinding.ActivityPublishBinding
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLEncoder

/**
 * شاشة نشر الإعلان - تدعم:
 * - رفع حتى 8 صور (الصورة الأولى غلاف الإعلان) + فيديو واحد (حد أقصى 60 ثانية)
 * - رفع الوسائط سحابياً وإرسال روابطها إلى أعمدة (images و video) عبر doPost
 * - زري النشر (مميز بمشاهدة فيديو مجاني / نشر عادي)
 */
class PublishActivity : AppCompatActivity() {

    private lateinit var binding: ActivityPublishBinding
    private var rewardedAd: RewardedAd? = null
    private val TAG = "RewardedAdLog"

    private val MAX_IMAGES = 8
    private val MAX_VIDEO_DURATION_MS = 60_000L

    private val selectedImageUris = mutableListOf<Uri>()
    private var selectedVideoUri: Uri? = null

    // ملاحظة: هذا معرّف تجريبي لاختبار إعلان المكافأة، ويتم استبداله بالمعرّف الحقيقي من لوحة AdMob لاحقاً
    private val AD_UNIT_ID = "ca-app-pub-3940256099942544/5224354917"

    // رابط Google Apps Script المربوط مع Google Sheets و Google Drive
    private val GOOGLE_SHEETS_SCRIPT_URL = 
        "https://script.google.com/macros/s/AKfycbz4zqsfEDYc8JEGgoVpg4dPFv8v8jIZx2LFg6a2RLuUmT8pfVCqrtP-Nrm08CBHGare/exec"

    private val pickImagesLauncher =
        registerForActivityResult(ActivityResultContracts.PickMultipleVisualMedia(MAX_IMAGES)) { uris ->
            if (uris.isNullOrEmpty()) return@registerForActivityResult
            val availableSlots = MAX_IMAGES - selectedImageUris.size
            if (availableSlots <= 0) {
                Toast.makeText(this, "الحد الأقصى للصور هو 8 صور", Toast.LENGTH_SHORT).show()
                return@registerForActivityResult
            }
            val added = uris.take(availableSlots)
            selectedImageUris.addAll(added)
            binding.tvImagesCounter.text = "الصور المختارة: \${selectedImageUris.size}/8 (الأولى غلاف الإعلان)"
        }

    private val pickVideoLauncher =
        registerForActivityResult(ActivityResultContracts.PickVisualMedia()) { uri ->
            if (uri == null) return@registerForActivityResult
            val retriever = MediaMetadataRetriever()
            try {
                retriever.setDataSource(this, uri)
                val durationMs = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_DURATION)?.toLongOrNull() ?: 0L
                if (durationMs > MAX_VIDEO_DURATION_MS) {
                    Toast.makeText(this, "الحد الأقصى لمدة الفيديو هو 60 ثانية", Toast.LENGTH_LONG).show()
                    return@registerForActivityResult
                }
                selectedVideoUri = uri
                binding.tvVideoStatus.text = "تم اختيار فيديو (\${durationMs / 1000} ثانية)"
            } finally {
                retriever.release()
            }
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityPublishBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // تحميل الإعلان عند فتح شاشة النشر
        loadRewardedAd()

        binding.btnPickImages.setOnClickListener {
            pickImagesLauncher.launch(
                PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)
            )
        }

        binding.btnPickVideo.setOnClickListener {
            pickVideoLauncher.launch(
                PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.VideoOnly)
            )
        }

        // زر نشر الإعلان مع خيار التثبيت بالمكافأة
        val btnPublishFeatured = findViewById<Button>(R.id.btnPublishFeatured)
        btnPublishFeatured.setOnClickListener {
            if (!validateInputs()) return@setOnClickListener

            showRewardedAd { 
                // هذه الدالة تنفذ فقط إذا شاهد المستخدم الفيديو كاملاً بنجاح
                publishAdToSheet(isFeatured = true)
            }
        }
        
        // زر النشر العادي المجاني
        val btnPublishNormal = findViewById<Button>(R.id.btnPublishNormal)
        btnPublishNormal.setOnClickListener {
            if (!validateInputs()) return@setOnClickListener

            publishAdToSheet(isFeatured = false)
        }
    }

    private fun loadRewardedAd() {
        val adRequest = AdRequest.Builder().build()
        RewardedAd.load(this, AD_UNIT_ID, adRequest, object : RewardedAdLoadCallback() {
            override fun onAdLoaded(ad: RewardedAd) {
                rewardedAd = ad
                Log.d(TAG, "تم تحميل إعلان المكافأة بنجاح")
            }

            override fun onAdFailedToLoad(adError: LoadAdError) {
                rewardedAd = null
                Log.d(TAG, "فشل تحميل الإعلان: \${adError.message}")
            }
        })
    }

    private fun showRewardedAd(onRewardEarned: () -> Unit) {
        if (rewardedAd != null) {
            rewardedAd?.show(this) { rewardItem ->
                // المستخدم شاهد الفيديو كاملاً وحصل على المكافأة!
                Log.d(TAG, "المكافأة تمت: \${rewardItem.amount}")
                onRewardEarned()
                
                // إعادة تحميل إعلان جديد للمرة القادمة
                loadRewardedAd()
            }
        } else {
            // في حال لم يكتمل تحميل الإعلان لسبب ما، يمكن تنبيه المستخدم أو إتمام النشر العادي
            Log.d(TAG, "إعلان المكافأة غير جاهز بعد.")
            // يمكنك هنا جعل النشر مباشراً أو إعلام المستخدم بإعادة المحاولة
            onRewardEarned() 
        }
    }

    private fun validateInputs(): Boolean {
        if (binding.etTitle.text.isNullOrBlank()) {
            binding.etTitle.error = "يرجى كتابة عنوان الإعلان"
            return false
        }
        if (binding.etPrice.text.isNullOrBlank()) {
            binding.etPrice.error = "يرجى كتابة السعر بالدينار"
            return false
        }
        return true
    }

    private fun uploadVideoToGoogleDrive(uri: Uri): String {
        val bytes = contentResolver.openInputStream(uri)?.use { it.readBytes() } ?: return ""
        val base64Data = android.util.Base64.encodeToString(bytes, android.util.Base64.NO_WRAP)

        val payload = JSONObject().apply {
            put("action", "uploadVideo")
            put("fileName", "ad-video-\${System.currentTimeMillis()}.mp4")
            put("mimeType", contentResolver.getType(uri) ?: "video/mp4")
            put("base64Data", base64Data)
        }

        val conn = URL(GOOGLE_SHEETS_SCRIPT_URL).openConnection() as HttpURLConnection
        conn.requestMethod = "POST"
        conn.doOutput = true
        conn.setRequestProperty("Content-Type", "text/plain;charset=utf-8")
        conn.outputStream.use { it.write(payload.toString().toByteArray(Charsets.UTF_8)) }

        val response = conn.inputStream.bufferedReader().use { it.readText() }
        return JSONObject(response).optString("videoUrl", "")
    }

    private fun encodeImageToDataUrl(uri: Uri): String {
        val bytes = contentResolver.openInputStream(uri)?.use { it.readBytes() } ?: return ""
        val base64 = android.util.Base64.encodeToString(bytes, android.util.Base64.NO_WRAP)
        return "data:image/jpeg;base64,\$base64"
    }

    private fun publishAdToSheet(isFeatured: Boolean) {
        // معالجة الصور ورفع الفيديو إلى Google Drive عبر Google Apps Script ثم إرسال الروابط عبر doPost
        binding.layoutPublishLoading.visibility = View.VISIBLE
        binding.tvPublishLoadingStatus.text = "جاري معالجة الصور ورفع الفيديو إلى Google Drive..."
        binding.btnPublishFeatured.isEnabled = false
        binding.btnPublishNormal.isEnabled = false

        val title = binding.etTitle.text.toString().trim()
        val price = binding.etPrice.text.toString().trim()
        val city = binding.spinnerCity.selectedItem?.toString() ?: "بغداد"
        val phone = binding.etPhone.text.toString().trim()
        val description = binding.etDescription.text.toString().trim()

        CoroutineScope(Dispatchers.IO).launch {
            try {
                val uploadedImages = JSONArray()
                val imagesList = selectedImageUris.take(MAX_IMAGES)
                imagesList.forEachIndexed { index, uri ->
                    withContext(Dispatchers.Main) {
                        binding.tvPublishLoadingStatus.text =
                            "جاري معالجة الصور... (صورة \${index + 1} من \${imagesList.size})"
                    }
                    val dataUrl = encodeImageToDataUrl(uri)
                    if (dataUrl.isNotEmpty()) uploadedImages.put(dataUrl)
                }
                val uploadedVideoUrl = selectedVideoUri?.let {
                    withContext(Dispatchers.Main) {
                        binding.tvPublishLoadingStatus.text = "جاري رفع الفيديو إلى Google Drive..."
                    }
                    uploadVideoToGoogleDrive(it)
                } ?: ""

                withContext(Dispatchers.Main) {
                    binding.tvPublishLoadingStatus.text = "جاري حفظ الإعلان في السوق..."
                }

                val url = URL(GOOGLE_SHEETS_SCRIPT_URL)
                val conn = url.openConnection() as HttpURLConnection
                conn.requestMethod = "POST"
                conn.doOutput = true
                conn.setRequestProperty("Content-Type", "application/json; charset=UTF-8")

                val jsonPayload = JSONObject().apply {
                    put("action", "create")
                    put("title", title)
                    put("price", price.toIntOrNull() ?: 0)
                    put("city", city)
                    put("phone", phone)
                    put("description", description)
                    put("images", uploadedImages)
                    put("video", uploadedVideoUrl)
                    put("is_featured", isFeatured)
                    put("featured", isFeatured)
                }

                conn.outputStream.use { it.write(jsonPayload.toString().toByteArray(Charsets.UTF_8)) }

                val responseCode = conn.responseCode
                withContext(Dispatchers.Main) {
                    binding.layoutPublishLoading.visibility = View.GONE
                    if (responseCode == 200) {
                        val msg = if (isFeatured) {
                            "تهانينا! تم نشر إعلانك وتثبيته في صدارة السوق مجاناً ⭐"
                        } else {
                            "تم نشر إعلانك بنجاح في سوق الدواجن والطيور"
                        }
                        Toast.makeText(this@PublishActivity, msg, Toast.LENGTH_LONG).show()
                        finish()
                    } else {
                        Toast.makeText(this@PublishActivity, "تعذر النشر، حاول مجدداً", Toast.LENGTH_SHORT).show()
                        binding.btnPublishFeatured.isEnabled = true
                        binding.btnPublishNormal.isEnabled = true
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    binding.layoutPublishLoading.visibility = View.GONE
                    binding.btnPublishFeatured.isEnabled = true
                    binding.btnPublishNormal.isEnabled = true
                    Toast.makeText(this@PublishActivity, "خطأ بالاتصال: \${e.message}", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }
}
`
  },
  {
    name: 'activity_publish.xml',
    path: 'res/layout/activity_publish.xml',
    language: 'xml',
    description: 'واجهة شاشة نشر الإعلان مع حقلي العنوان والسعر، وبانر إعلان المكافأة، وزري النشر (btnPublishFeatured و btnPublishNormal)',
    code: `<?xml version="1.0" encoding="utf-8"?>
<!-- 
  سوق الدواجن والطيور العراقي - Iraqi Poultry & Birds Marketplace
  Publish Activity Screen with Google AdMob Rewarded Ad Integration
  Dual Publish Buttons:
  1. btnPublishFeatured: "نشر وتثبيت مميز (مشاهدة فيديو مجاني) 🎬"
  2. btnPublishNormal: "نشر عادي"
-->
<androidx.coordinatorlayout.widget.CoordinatorLayout 
    xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    xmlns:tools="http://schemas.android.com/tools"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="@color/bg_soft_gray"
    android:layoutDirection="rtl"
    android:textDirection="rtl">

    <com.google.android.material.appbar.AppBarLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:background="@color/card_white"
        app:elevation="1dp">

        <com.google.android.material.appbar.MaterialToolbar
            android:id="@+id/publishToolbar"
            android:layout_width="match_parent"
            android:layout_height="?attr/actionBarSize"
            app:title="إضافة إعلان جديد"
            app:titleTextColor="@color/text_primary"
            app:navigationIcon="@drawable/ic_arrow_back_24"
            app:navigationIconTint="@color/text_primary" />
    </com.google.android.material.appbar.AppBarLayout>

    <androidx.core.widget.NestedScrollView
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        android:fillViewport="true"
        app:layout_behavior="@string/appbar_scrolling_view_behavior">

        <LinearLayout
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:orientation="vertical"
            android:padding="16dp">

            <!-- Title Field -->
            <com.google.android.material.textfield.TextInputLayout
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:hint="عنوان الإعلان (دجاج بلدي بياض / زوج زاجل أصيل...)"
                style="@style/Widget.Material3.TextInputLayout.OutlinedBox">
                <com.google.android.material.textfield.TextInputEditText
                    android:id="@+id/etTitle"
                    android:layout_width="match_parent"
                    android:layout_height="wrap_content"
                    android:inputType="text" />
            </com.google.android.material.textfield.TextInputLayout>

            <!-- Price Field in IQD -->
            <com.google.android.material.textfield.TextInputLayout
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:layout_marginTop="12dp"
                android:hint="السعر بالدينار العراقي (د.ع)"
                app:suffixText="د.ع"
                style="@style/Widget.Material3.TextInputLayout.OutlinedBox">
                <com.google.android.material.textfield.TextInputEditText
                    android:id="@+id/etPrice"
                    android:layout_width="match_parent"
                    android:layout_height="wrap_content"
                    android:inputType="number" />
            </com.google.android.material.textfield.TextInputLayout>

            <!-- City Governorate Spinner -->
            <TextView
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:text="المحافظة"
                android:textSize="12sp"
                android:textColor="@color/text_secondary"
                android:layout_marginTop="12dp"
                android:layout_marginBottom="4dp" />
            <Spinner
                android:id="@+id/spinnerCity"
                android:layout_width="match_parent"
                android:layout_height="48dp"
                android:background="@drawable/bg_pill_inactive" />

            <!-- Phone Field -->
            <com.google.android.material.textfield.TextInputLayout
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:layout_marginTop="12dp"
                android:hint="رقم الهاتف (آسيا سيل أو زين)"
                style="@style/Widget.Material3.TextInputLayout.OutlinedBox">
                <com.google.android.material.textfield.TextInputEditText
                    android:id="@+id/etPhone"
                    android:layout_width="match_parent"
                    android:layout_height="wrap_content"
                    android:inputType="phone" />
            </com.google.android.material.textfield.TextInputLayout>

            <!-- Description Field -->
            <com.google.android.material.textfield.TextInputLayout
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:layout_marginTop="12dp"
                android:hint="تفاصيل السلالة، اللقاحات، طريقة الاستلام..."
                style="@style/Widget.Material3.TextInputLayout.OutlinedBox">
                <com.google.android.material.textfield.TextInputEditText
                    android:id="@+id/etDescription"
                    android:layout_width="match_parent"
                    android:layout_height="wrap_content"
                    android:minLines="3"
                    android:gravity="top|start"
                    android:inputType="textMultiLine" />
            </com.google.android.material.textfield.TextInputLayout>

            <!-- قسم الصور والفيديو (قبل زر النشر النهائي) -->
            <com.google.android.material.card.MaterialCardView
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:layout_marginTop="16dp"
                app:cardBackgroundColor="@color/card_white"
                app:cardCornerRadius="16dp"
                app:strokeColor="@color/border_hairline"
                app:strokeWidth="1dp">

                <LinearLayout
                    android:layout_width="match_parent"
                    android:layout_height="wrap_content"
                    android:orientation="vertical"
                    android:padding="14dp">

                    <TextView
                        android:layout_width="wrap_content"
                        android:layout_height="wrap_content"
                        android:text="الصور والفيديو"
                        android:textColor="@color/text_primary"
                        android:textSize="14sp"
                        android:textStyle="bold" />

                    <TextView
                        android:layout_width="match_parent"
                        android:layout_height="wrap_content"
                        android:layout_marginTop="4dp"
                        android:text="حتى 8 صور وفيديو واحد مدته 60 ثانية كحد أقصى. الصورة الأولى غلاف الإعلان."
                        android:textColor="@color/text_secondary"
                        android:textSize="12sp" />

                    <com.google.android.material.button.MaterialButton
                        android:id="@+id/btnPickImages"
                        style="@style/Widget.Material3.Button.OutlinedButton"
                        android:layout_width="match_parent"
                        android:layout_height="44dp"
                        android:layout_marginTop="10dp"
                        android:text="إضافة صور"
                        android:textColor="@color/eco_green_dark"
                        app:cornerRadius="12dp"
                        app:strokeColor="@color/eco_green" />

                    <TextView
                        android:id="@+id/tvImagesCounter"
                        android:layout_width="wrap_content"
                        android:layout_height="wrap_content"
                        android:layout_marginTop="4dp"
                        android:text="الصور المختارة: 0/8"
                        android:textColor="@color/eco_green_dark"
                        android:textSize="11sp" />

                    <com.google.android.material.button.MaterialButton
                        android:id="@+id/btnPickVideo"
                        style="@style/Widget.Material3.Button.OutlinedButton"
                        android:layout_width="match_parent"
                        android:layout_height="44dp"
                        android:layout_marginTop="8dp"
                        android:text="اختر فيديو قصير من جهازك"
                        android:textColor="@color/text_primary"
                        app:cornerRadius="12dp"
                        app:strokeColor="@color/border_hairline" />

                    <TextView
                        android:id="@+id/tvVideoStatus"
                        android:layout_width="wrap_content"
                        android:layout_height="wrap_content"
                        android:layout_marginTop="4dp"
                        android:text="لم يتم اختيار فيديو بعد"
                        android:textColor="@color/text_secondary"
                        android:textSize="11sp" />
                </LinearLayout>
            </com.google.android.material.card.MaterialCardView>

            <!-- Featured Gold Badge Promo Card -->
            <com.google.android.material.card.MaterialCardView
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:layout_marginTop="12dp"
                app:cardBackgroundColor="@color/eco_green_light"
                app:cardCornerRadius="16dp"
                app:strokeColor="@color/eco_green"
                app:strokeWidth="1dp">

                <LinearLayout
                    android:layout_width="match_parent"
                    android:layout_height="wrap_content"
                    android:orientation="horizontal"
                    android:padding="12dp"
                    android:gravity="center_vertical">

                    <TextView
                        android:layout_width="wrap_content"
                        android:layout_height="wrap_content"
                        android:text="⭐"
                        android:textSize="24sp"
                        android:layout_marginStart="8dp" />

                    <LinearLayout
                        android:layout_width="0dp"
                        android:layout_height="wrap_content"
                        android:layout_weight="1"
                        android:orientation="vertical"
                        android:layout_marginStart="8dp">

                        <TextView
                            android:layout_width="wrap_content"
                            android:layout_height="wrap_content"
                            android:text="ميزة التثبيت والتمييز الذهبي ✨"
                            android:textColor="@color/eco_green_dark"
                            android:textStyle="bold"
                            android:textSize="13sp" />

                        <TextView
                            android:layout_width="wrap_content"
                            android:layout_height="wrap_content"
                            android:text="شاهد مقطع فيديو قصير لتثبيت إعلانك في صدارة نتائج البحث وتمييزه بشارة ذهبية مجاناً وبدون أي رسوم."
                            android:textColor="@color/text_secondary"
                            android:textSize="11sp" />
                    </LinearLayout>
                </LinearLayout>
            </com.google.android.material.card.MaterialCardView>

            <LinearLayout
                android:id="@+id/layoutPublishLoading"
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:layout_marginTop="12dp"
                android:background="@color/eco_green_light"
                android:gravity="center"
                android:orientation="horizontal"
                android:padding="12dp"
                android:visibility="gone">

                <ProgressBar
                    android:id="@+id/progressPublish"
                    android:layout_width="22dp"
                    android:layout_height="22dp"
                    android:layout_marginEnd="8dp" />

                <TextView
                    android:id="@+id/tvPublishLoadingStatus"
                    android:layout_width="wrap_content"
                    android:layout_height="wrap_content"
                    android:text="جاري رفع الصور والفيديو..."
                    android:textColor="@color/eco_green_dark"
                    android:textSize="13sp"
                    android:textStyle="bold" />
            </LinearLayout>

            <!-- 1. btnPublishFeatured (مشاهدة فيديو مجاني) -->
            <com.google.android.material.button.MaterialButton
                android:id="@+id/btnPublishFeatured"
                style="@style/Widget.Material3.Button"
                android:layout_width="match_parent"
                android:layout_height="52dp"
                android:layout_marginTop="16dp"
                android:text="نشر وتثبيت مميز (مشاهدة فيديو مجاني) 🎬"
                android:textColor="@color/card_white"
                android:textSize="14sp"
                android:textStyle="bold"
                app:backgroundTint="@color/eco_green"
                app:cornerRadius="14dp" />

            <!-- 2. btnPublishNormal (نشر عادي) -->
            <com.google.android.material.button.MaterialButton
                android:id="@+id/btnPublishNormal"
                style="@style/Widget.Material3.Button.TonalButton"
                android:layout_width="match_parent"
                android:layout_height="48dp"
                android:layout_marginTop="8dp"
                android:text="نشر عادي"
                android:textColor="@color/text_primary"
                android:textSize="13sp"
                app:backgroundTint="@color/bg_pill_inactive"
                app:cornerRadius="14dp" />

        </LinearLayout>
    </androidx.core.widget.NestedScrollView>

</androidx.coordinatorlayout.widget.CoordinatorLayout>
`
  }
];





