<?php

// Script to test all the auth endpoints systematically
$baseUrl = 'http://localhost/api/auth';
$email = 'admin@test.com';
$password = 'password';

function makeRequest($method, $endpoint, $data = [], $token = null)
{
    global $baseUrl;
    $ch = curl_init();
    $url = $baseUrl.$endpoint;

    $headers = [
        'Content-Type: application/json',
        'Accept: application/json',
    ];

    if ($token) {
        $headers[] = 'Authorization: Bearer '.$token;
    }

    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        if (! empty($data)) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }
    }

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return [
        'code' => $httpCode,
        'body' => json_decode($response, true),
    ];
}

echo "=== TEST SEQUENCE FOR AUTH SERVICE ===\n\n";

// 1. POST /login - valid credentials
echo "1. POST /login - Valid Credentials\n";
$res1 = makeRequest('POST', '/login', ['email' => $email, 'password' => $password]);
echo 'Status: '.$res1['code']."\n";
echo 'Response: '.json_encode($res1['body'], JSON_PRETTY_PRINT)."\n\n";

$accessToken = $res1['body']['access_token'] ?? null;
$refreshToken = $res1['body']['refresh_token'] ?? null;

// 2. POST /login - invalid password
echo "2. POST /login - Invalid Password\n";
$res2 = makeRequest('POST', '/login', ['email' => $email, 'password' => 'wrongpass']);
echo 'Status: '.$res2['code']."\n";
echo 'Response: '.json_encode($res2['body'], JSON_PRETTY_PRINT)."\n\n";

// 3. POST /verify - valid token
echo "3. POST /verify - Valid Token\n";
$res3 = makeRequest('POST', '/verify', [], $accessToken);
echo 'Status: '.$res3['code']."\n";
echo 'Response: '.json_encode($res3['body'], JSON_PRETTY_PRINT)."\n\n";

// 4. POST /verify - invalid token
echo "4. POST /verify - Invalid Token\n";
$res4 = makeRequest('POST', '/verify', [], 'invalid-token-here');
echo 'Status: '.$res4['code']."\n";
echo 'Response: '.json_encode($res4['body'], JSON_PRETTY_PRINT)."\n\n";

// 5. POST /refresh - (Our current implementation uses the expired JWT, not the refresh token string for the /refresh endpoint.
// We will need to check how the refresh logic was meant to be implemented based on the spec).
echo "5. POST /refresh\n";
// Let's modify our logic to just call the endpoint with the current token for now to see what it does.
$res5 = makeRequest('POST', '/refresh', ['refresh_token' => $refreshToken], $accessToken);
echo 'Status: '.$res5['code']."\n";
echo 'Response: '.json_encode($res5['body'], JSON_PRETTY_PRINT)."\n\n";

// Use the new token from now on if it exists
if (isset($res5['body']['access_token'])) {
    $accessToken = $res5['body']['access_token'];
}

// 6. GET /me - valid token
echo "6. GET /me\n";
$res6 = makeRequest('GET', '/me', [], $accessToken);
echo 'Status: '.$res6['code']."\n";
echo 'Response: '.json_encode($res6['body'], JSON_PRETTY_PRINT)."\n\n";

// 7. POST /logout
echo "7. POST /logout\n";
$res7 = makeRequest('POST', '/logout', [], $accessToken);
echo 'Status: '.$res7['code']."\n";
echo 'Response: '.json_encode($res7['body'], JSON_PRETTY_PRINT)."\n\n";

// 8. GET /me - after logout
echo "8. GET /me - Post Logout\n";
$res8 = makeRequest('GET', '/me', [], $accessToken);
echo 'Status: '.$res8['code']."\n";
echo 'Response: '.json_encode($res8['body'], JSON_PRETTY_PRINT)."\n\n";
