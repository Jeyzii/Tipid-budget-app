<?php

namespace Tests\Feature;

// use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * A basic test example.
     */
    public function test_the_application_returns_a_successful_response(): void
    {
        $response = $this->get('/');

        $this->assertTrue(
            $response->isOk() || $response->isRedirect(),
            'Home should serve the welcome page or redirect to the built SPA.'
        );

        if ($response->isRedirect()) {
            $response->assertRedirect(url('/app/'));
        }
    }
}
