<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = [
        'key',
        'value',
        'group',
        'type',
    ];

    /**
     * Get value with automatic casting.
     */
    public function getValueAttribute($value)
    {
        return match ($this->type) {
            'json'    => json_decode($value, true),
            'boolean' => (bool) $value,
            'integer' => (int) $value,
            default   => $value,
        };
    }

    /**
     * Set value with automatic encoding.
     */
    public function setValueAttribute($value)
    {
        if (is_array($value) || is_object($value)) {
            $this->attributes['value'] = json_encode($value);
            $this->attributes['type'] = 'json';
        } else {
            $this->attributes['value'] = $value;
        }
    }

    /**
     * Helper to get setting by key.
     */
    public static function get(string $key, $default = null)
    {
        $setting = self::where('key', $key)->first();
        return $setting ? $setting->value : $default;
    }

    /**
     * Helper to set setting by key.
     */
    public static function set(string $key, $value, string $group = 'general')
    {
        return self::updateOrCreate(
            ['key' => $key],
            ['value' => $value, 'group' => $group]
        );
    }
}
