<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class CustomerRegistrationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Mail::fake();
        Role::create(['name' => 'CLIENTE', 'guard_name' => 'web']);
    }

    private function details(): array
    {
        return [
            'phone' => '+591 71234567', 'country' => 'Bolivia', 'department' => 'Cochabamba',
            'city' => 'Quillacollo', 'shipping_address' => 'Calle Bolivia 123, zona central',
            'postal_code' => '1234', 'address_reference' => 'Frente a la plaza',
        ];
    }

    private function registration(): array
    {
        return [...$this->details(), 'name' => ' Ana Pérez ', 'email' => ' ANA@example.test ',
            'password' => 'Password123!', 'password_confirmation' => 'Password123!', 'accept_terms' => true];
    }

    public function test_registration_persists_delivery_details_and_exposes_them_on_login_and_profile(): void
    {
        $response = $this->postJson('/api/auth/register', $this->registration())
            ->assertCreated()->assertJsonPath('user.phone', '+591 71234567')
            ->assertJsonPath('user.city', 'Quillacollo');
        $user = User::firstOrFail();
        $this->assertDatabaseHas('users', [...$this->details(), 'email' => 'ana@example.test', 'name' => 'Ana Pérez']);
        $this->assertNotNull($user->terms_accepted_at);
        $this->assertTrue($user->hasRole('CLIENTE'));
        $this->assertTrue(Hash::check('Password123!', $user->password));
        $this->postJson('/api/auth/login', ['email' => $user->email, 'password' => 'Password123!'])
            ->assertOk()->assertJsonPath('user.shipping_address', $this->details()['shipping_address']);
        $this->withHeader('Authorization', 'Bearer ' . $response->json('token'))
            ->getJson('/api/profile')->assertOk()->assertJsonPath('user.postal_code', '1234');
    }

    public function test_required_details_and_terms_are_validated_before_creating_account(): void
    {
        $data = $this->registration();
        foreach (['phone','department','city','shipping_address','country','accept_terms'] as $field) {
            $invalid = $data;
            unset($invalid[$field]);
            $this->postJson('/api/auth/register', $invalid)->assertUnprocessable()->assertJsonValidationErrors($field);
        }
        $this->postJson('/api/auth/register', [...$data, 'phone' => '-------', 'accept_terms' => false, 'department' => 'Invalid'])
            ->assertUnprocessable()->assertJsonValidationErrors(['phone', 'accept_terms', 'department']);
        $this->assertSame(0, User::count());
        $this->postJson('/api/auth/register', [...$data, 'country' => ['Bolivia']])
            ->assertUnprocessable()->assertJsonValidationErrors('country');
    }

    public function test_optional_fields_can_be_omitted_and_email_uniqueness_is_case_insensitive(): void
    {
        $data = $this->registration();
        unset($data['postal_code'], $data['address_reference']);
        $this->postJson('/api/auth/register', $data)->assertCreated();
        $this->postJson('/api/auth/register', [...$data, 'email' => 'ANA@EXAMPLE.TEST'])
            ->assertUnprocessable()->assertJsonValidationErrors('email');
        $this->assertSame(1, User::count());
    }

    public function test_foreign_country_and_region_are_saved_and_editable(): void
    {
        $this->postJson('/api/auth/register', [...$this->registration(), 'country' => 'Argentina', 'department' => 'Buenos Aires'])
            ->assertCreated()->assertJsonPath('user.country', 'Argentina')->assertJsonPath('user.department', 'Buenos Aires');
        $user = User::firstOrFail();
        $this->actingAs($user, 'sanctum')->putJson('/api/profile', ['name' => $user->name, 'country' => 'España', 'department' => 'Madrid'])
            ->assertOk()->assertJsonPath('user.country', 'España')->assertJsonPath('user.department', 'Madrid');
        $this->actingAs($user, 'sanctum')->putJson('/api/profile', ['name' => $user->name, 'country' => 'Bolivia', 'department' => 'Madrid'])
            ->assertUnprocessable()->assertJsonValidationErrors('department');
        $this->assertSame('España', $user->fresh()->country);
    }

    public function test_existing_accounts_can_update_details_without_changing_roles_or_password(): void
    {
        $user = User::factory()->create();
        $user->assignRole('CLIENTE');
        $oldPassword = $user->password;
        $this->actingAs($user, 'sanctum')->putJson('/api/profile', [
            ...$this->details(), 'name' => 'Nombre actualizado', 'primary_role' => 'SUPER_ADMIN',
        ])->assertOk()->assertJsonPath('user.city', 'Quillacollo');
        $this->assertSame($oldPassword, $user->fresh()->password);
        $this->assertTrue($user->fresh()->hasRole('CLIENTE'));
        $this->assertFalse($user->fresh()->hasRole('SUPER_ADMIN'));
        $this->actingAs($user, 'sanctum')->putJson('/api/profile', ['name' => 'Nombre anterior'])
            ->assertOk()->assertJsonPath('user.city', 'Quillacollo');
    }
}
