package com.example.data.preferences

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.emptyPreferences
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.map
import java.io.IOException

val Context.userDataStore: DataStore<Preferences> by preferencesDataStore(name = "smart_procure_user_prefs")

enum class AppThemeMode(val displayName: String, val description: String) {
    SYSTEM("Follow System", "Match Android device theme settings"),
    LIGHT("Light Theme", "Crisp high-contrast enterprise palette"),
    DARK("Dark Theme", "Eye-safe twilight bento palette")
}

class UserPreferencesRepository(private val context: Context) {

    companion object {
        val KEY_THEME_MODE = stringPreferencesKey("app_theme_mode")
        val KEY_LOGGED_IN_USER_ID = stringPreferencesKey("logged_in_user_id")
        val KEY_LOGGED_IN_EMAIL = stringPreferencesKey("logged_in_user_email")
    }

    val themeMode: Flow<AppThemeMode> = context.userDataStore.data
        .catch { exception ->
            if (exception is IOException) {
                emit(emptyPreferences())
            } else {
                throw exception
            }
        }
        .map { preferences ->
            val modeStr = preferences[KEY_THEME_MODE] ?: AppThemeMode.SYSTEM.name
            try {
                AppThemeMode.valueOf(modeStr)
            } catch (e: Exception) {
                AppThemeMode.SYSTEM
            }
        }

    val loggedInUserId: Flow<String?> = context.userDataStore.data
        .catch { exception ->
            if (exception is IOException) {
                emit(emptyPreferences())
            } else {
                throw exception
            }
        }
        .map { preferences ->
            preferences[KEY_LOGGED_IN_USER_ID]
        }

    suspend fun setThemeMode(mode: AppThemeMode) {
        context.userDataStore.edit { preferences ->
            preferences[KEY_THEME_MODE] = mode.name
        }
    }

    suspend fun setLoggedInUser(userId: String?, email: String? = null) {
        context.userDataStore.edit { preferences ->
            if (userId != null) {
                preferences[KEY_LOGGED_IN_USER_ID] = userId
                if (email != null) {
                    preferences[KEY_LOGGED_IN_EMAIL] = email
                }
            } else {
                preferences.remove(KEY_LOGGED_IN_USER_ID)
                preferences.remove(KEY_LOGGED_IN_EMAIL)
            }
        }
    }

    suspend fun clearSession() {
        context.userDataStore.edit { preferences ->
            preferences.remove(KEY_LOGGED_IN_USER_ID)
            preferences.remove(KEY_LOGGED_IN_EMAIL)
        }
    }
}
