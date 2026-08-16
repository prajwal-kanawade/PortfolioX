using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PortfolioX.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "admins",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    email = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    username = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    password_hash = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    first_name = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    last_name = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    profile_photo_url = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    is_active = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_admins", x => x.id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "email_templates",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    template_key = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    subject = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    html_body = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    updated_at = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_email_templates", x => x.id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "email_verification_otps",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    email = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    otp_hash = table.Column<string>(type: "varchar(64)", maxLength: 64, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    attempts = table.Column<int>(type: "int", nullable: false),
                    is_verified = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    verified_at = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    expires_at = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_email_verification_otps", x => x.id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "error_logs",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    message = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    stack_trace = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    path = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    http_method = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    status_code = table.Column<int>(type: "int", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_error_logs", x => x.id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "portfolio_templates",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    code = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    name = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    description = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    category = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    thumbnail_url = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    is_active = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_portfolio_templates", x => x.id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "subscription_plans",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    name = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    tier = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    price_monthly = table.Column<decimal>(type: "decimal(65,30)", nullable: false),
                    price_annually = table.Column<decimal>(type: "decimal(65,30)", nullable: true),
                    max_portfolios = table.Column<int>(type: "int", nullable: true),
                    max_projects = table.Column<int>(type: "int", nullable: true),
                    custom_domain = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    ai_credits = table.Column<int>(type: "int", nullable: false),
                    features = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    is_active = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_subscription_plans", x => x.id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    email = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    username = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    password_hash = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    first_name = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    last_name = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    profile_photo_url = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    bio = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    subscription_tier = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    is_active = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    is_banned = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    banned_at = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    ban_reason = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    is_approved = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_users", x => x.id);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "admin_refresh_tokens",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    admin_id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    token = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    expires_at = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_admin_refresh_tokens", x => x.id);
                    table.ForeignKey(
                        name: "f_k_admin_refresh_tokens_admins_admin_id",
                        column: x => x.admin_id,
                        principalTable: "admins",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "site_settings",
                columns: table => new
                {
                    id = table.Column<byte>(type: "tinyint unsigned", nullable: false),
                    website_name = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    footer_text = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    maintenance_mode = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    active_logo_key = table.Column<string>(type: "varchar(30)", maxLength: 30, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    smtp_host = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    smtp_port = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    smtp_username = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    smtp_password = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    smtp_from_email = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    smtp_from_name = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    jwt_expiry_minutes = table.Column<int>(type: "int", nullable: false),
                    refresh_token_expiry_days = table.Column<int>(type: "int", nullable: false),
                    session_timeout_minutes = table.Column<int>(type: "int", nullable: false),
                    password_min_length = table.Column<int>(type: "int", nullable: false),
                    password_require_uppercase = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    password_require_number = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    password_require_special = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    max_login_attempts = table.Column<int>(type: "int", nullable: false),
                    login_lockout_minutes = table.Column<int>(type: "int", nullable: false),
                    allow_new_registrations = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    require_email_verification = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    requires_approval = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    allow_public_portfolios = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    allow_portfolio_downloads = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    max_upload_size_mb = table.Column<int>(type: "int", nullable: false),
                    allowed_image_types = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    default_template_id = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    enable_likes = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    enable_comments = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    enable_follow_system = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    admin_alert_email = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    notify_admin_new_registration = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    notify_admin_payment_success = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    show_signups_widget = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    show_templates_widget = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    show_subscription_widget = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_site_settings", x => x.id);
                    table.ForeignKey(
                        name: "f_k_site_settings_portfolio_templates_default_template_id",
                        column: x => x.default_template_id,
                        principalTable: "portfolio_templates",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "bug_reports",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    user_id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    description = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    page_url = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    status = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_bug_reports", x => x.id);
                    table.ForeignKey(
                        name: "f_k_bug_reports__users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "cover_letters",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    user_id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    title = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    content = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    template_name = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_cover_letters", x => x.id);
                    table.ForeignKey(
                        name: "f_k_cover_letters__users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "login_audit_logs",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    user_id = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    email = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    success = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    failure_reason = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ip_address = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    user_agent = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    browser = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    operating_system = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    is_new_device = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_login_audit_logs", x => x.id);
                    table.ForeignKey(
                        name: "f_k_login_audit_logs__users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "login_verification_tokens",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    user_id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    token_hash = table.Column<string>(type: "varchar(64)", maxLength: 64, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    device_id = table.Column<string>(type: "varchar(64)", maxLength: 64, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    browser = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    operating_system = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    user_agent = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ip_address = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    remember_device = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    is_used = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    expires_at = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_login_verification_tokens", x => x.id);
                    table.ForeignKey(
                        name: "f_k_login_verification_tokens__users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "notifications",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    user_id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    title = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    message = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    notification_type = table.Column<string>(type: "varchar(30)", maxLength: 30, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    link = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    is_read = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_notifications", x => x.id);
                    table.ForeignKey(
                        name: "f_k_notifications__users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "password_reset_tokens",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    user_id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    otp_hash = table.Column<string>(type: "varchar(64)", maxLength: 64, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    attempts = table.Column<int>(type: "int", nullable: false),
                    is_used = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    expires_at = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_password_reset_tokens", x => x.id);
                    table.ForeignKey(
                        name: "f_k_password_reset_tokens__users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "portfolios",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    user_id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    template_id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    title = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    slug = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    headline = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    about_me = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    photo_url = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    is_published = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    custom_domain = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    portfolio_score = table.Column<int>(type: "int", nullable: false),
                    view_count = table.Column<int>(type: "int", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_portfolios", x => x.id);
                    table.ForeignKey(
                        name: "f_k_portfolios__portfolio_templates_template_id",
                        column: x => x.template_id,
                        principalTable: "portfolio_templates",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "f_k_portfolios__users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "refresh_tokens",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    user_id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    token = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    expires_at = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_refresh_tokens", x => x.id);
                    table.ForeignKey(
                        name: "f_k_refresh_tokens__users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "resumes",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    user_id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    title = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    file_url = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ats_score = table.Column<int>(type: "int", nullable: false),
                    is_primary = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    template_code = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    full_name = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    phone = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    email = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    linked_in_url = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    location = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    summary = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_resumes", x => x.id);
                    table.ForeignKey(
                        name: "f_k_resumes__users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "trusted_devices",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    user_id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    device_id = table.Column<string>(type: "varchar(64)", maxLength: 64, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    browser = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    operating_system = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    user_agent = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ip_address = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    trusted_at = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    expires_at = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    last_login_at = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_trusted_devices", x => x.id);
                    table.ForeignKey(
                        name: "f_k_trusted_devices__users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "user_complaints",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    user_id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    subject = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    message = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    status = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_user_complaints", x => x.id);
                    table.ForeignKey(
                        name: "f_k_user_complaints_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "user_follows",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    follower_id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    followee_id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_user_follows", x => x.id);
                    table.ForeignKey(
                        name: "FK_user_follows_users_followee_id",
                        column: x => x.followee_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_user_follows_users_follower_id",
                        column: x => x.follower_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "user_settings",
                columns: table => new
                {
                    user_id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    is_profile_public = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    search_engine_visible = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    email_notifications = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    security_alert_emails = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    contact_message_notifications = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    subscription_reminder_emails = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    accent_color = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    font_size = table.Column<string>(type: "varchar(10)", maxLength: 10, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    theme_name = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    default_template_id = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    auto_save_enabled = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_user_settings", x => x.user_id);
                    table.ForeignKey(
                        name: "f_k_user_settings_portfolio_templates_default_template_id",
                        column: x => x.default_template_id,
                        principalTable: "portfolio_templates",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "f_k_user_settings_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "user_subscriptions",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    user_id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    plan_id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    status = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    start_date = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    end_date = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    auto_renew = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    ai_credits_used = table.Column<int>(type: "int", nullable: false),
                    ai_credits_reset_at = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_user_subscriptions", x => x.id);
                    table.ForeignKey(
                        name: "f_k_user_subscriptions_subscription_plans_plan_id",
                        column: x => x.plan_id,
                        principalTable: "subscription_plans",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "f_k_user_subscriptions_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "appointments",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    portfolio_id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    visitor_name = table.Column<string>(type: "varchar(150)", maxLength: 150, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    visitor_email = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    note = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    appointment_date = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    time_slot = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    status = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_appointments", x => x.id);
                    table.ForeignKey(
                        name: "f_k_appointments__portfolios_portfolio_id",
                        column: x => x.portfolio_id,
                        principalTable: "portfolios",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "comments",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    portfolio_id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    user_id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    parent_comment_id = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    content = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_comments", x => x.id);
                    table.ForeignKey(
                        name: "f_k_comments__portfolios_portfolio_id",
                        column: x => x.portfolio_id,
                        principalTable: "portfolios",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "f_k_comments__users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "f_k_comments_comments_parent_comment_id",
                        column: x => x.parent_comment_id,
                        principalTable: "comments",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "feedback",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    portfolio_id = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    user_id = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    rating = table.Column<int>(type: "int", nullable: true),
                    message = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_feedbacks", x => x.id);
                    table.ForeignKey(
                        name: "f_k_feedbacks__portfolios_portfolio_id",
                        column: x => x.portfolio_id,
                        principalTable: "portfolios",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "f_k_feedbacks__users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "portfolio_books",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    portfolio_id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    title = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    description = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    genre = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    published_year = table.Column<int>(type: "int", nullable: true),
                    cover_image_url = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    sort_order = table.Column<int>(type: "int", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_portfolio_books", x => x.id);
                    table.ForeignKey(
                        name: "f_k_portfolio_books_portfolios_portfolio_id",
                        column: x => x.portfolio_id,
                        principalTable: "portfolios",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "portfolio_contact_messages",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    portfolio_id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    visitor_name = table.Column<string>(type: "varchar(150)", maxLength: 150, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    visitor_email = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    message = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_portfolio_contact_messages", x => x.id);
                    table.ForeignKey(
                        name: "f_k_portfolio_contact_messages_portfolios_portfolio_id",
                        column: x => x.portfolio_id,
                        principalTable: "portfolios",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "portfolio_education",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    portfolio_id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    institution_name = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    degree = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    field_of_study = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    graduation_date = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    description = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    sort_order = table.Column<int>(type: "int", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_portfolio_educations", x => x.id);
                    table.ForeignKey(
                        name: "f_k_portfolio_educations_portfolios_portfolio_id",
                        column: x => x.portfolio_id,
                        principalTable: "portfolios",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "portfolio_experience",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    portfolio_id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    job_title = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    company_name = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    location = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    description = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    start_date = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    end_date = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    is_current = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    sort_order = table.Column<int>(type: "int", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_portfolio_experiences", x => x.id);
                    table.ForeignKey(
                        name: "f_k_portfolio_experiences_portfolios_portfolio_id",
                        column: x => x.portfolio_id,
                        principalTable: "portfolios",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "portfolio_gallery_photos",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    portfolio_id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    image_url = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    caption = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    sort_order = table.Column<int>(type: "int", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_portfolio_gallery_photos", x => x.id);
                    table.ForeignKey(
                        name: "f_k_portfolio_gallery_photos_portfolios_portfolio_id",
                        column: x => x.portfolio_id,
                        principalTable: "portfolios",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "portfolio_likes",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    portfolio_id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    user_id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_portfolio_likes", x => x.id);
                    table.ForeignKey(
                        name: "f_k_portfolio_likes__users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "f_k_portfolio_likes_portfolios_portfolio_id",
                        column: x => x.portfolio_id,
                        principalTable: "portfolios",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "portfolio_projects",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    portfolio_id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    title = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    description = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    image_url = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    project_url = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    github_url = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    technologies = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    start_date = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    end_date = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    sort_order = table.Column<int>(type: "int", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_portfolio_projects", x => x.id);
                    table.ForeignKey(
                        name: "f_k_portfolio_projects_portfolios_portfolio_id",
                        column: x => x.portfolio_id,
                        principalTable: "portfolios",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "portfolio_skills",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    portfolio_id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    skill_name = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    proficiency_level = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    endorsements = table.Column<int>(type: "int", nullable: false),
                    sort_order = table.Column<int>(type: "int", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_portfolio_skills", x => x.id);
                    table.ForeignKey(
                        name: "f_k_portfolio_skills_portfolios_portfolio_id",
                        column: x => x.portfolio_id,
                        principalTable: "portfolios",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "portfolio_views",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    portfolio_id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    visitor_ip = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    referrer = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    viewed_at = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_portfolio_views", x => x.id);
                    table.ForeignKey(
                        name: "f_k_portfolio_views_portfolios_portfolio_id",
                        column: x => x.portfolio_id,
                        principalTable: "portfolios",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "resume_educations",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    resume_id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    degree = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    university = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    graduation_date = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    bullets = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    sort_order = table.Column<int>(type: "int", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_resume_educations", x => x.id);
                    table.ForeignKey(
                        name: "f_k_resume_educations_resumes_resume_id",
                        column: x => x.resume_id,
                        principalTable: "resumes",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "resume_experiences",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    resume_id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    job_title = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    company_name = table.Column<string>(type: "varchar(255)", maxLength: 255, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    location = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    start_date = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    end_date = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    is_current = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    bullets = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    sort_order = table.Column<int>(type: "int", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_resume_experiences", x => x.id);
                    table.ForeignKey(
                        name: "f_k_resume_experiences_resumes_resume_id",
                        column: x => x.resume_id,
                        principalTable: "resumes",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "resume_skill_categories",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    resume_id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    category_name = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    content = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    sort_order = table.Column<int>(type: "int", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_resume_skill_categories", x => x.id);
                    table.ForeignKey(
                        name: "f_k_resume_skill_categories_resumes_resume_id",
                        column: x => x.resume_id,
                        principalTable: "resumes",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "payments",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    user_id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    subscription_id = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    amount = table.Column<decimal>(type: "decimal(65,30)", nullable: false),
                    currency = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    payment_method = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    status = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    transaction_id = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    refund_reason = table.Column<string>(type: "longtext", nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    refunded_at = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_payments", x => x.id);
                    table.ForeignKey(
                        name: "f_k_payments__user_subscriptions_subscription_id",
                        column: x => x.subscription_id,
                        principalTable: "user_subscriptions",
                        principalColumn: "id");
                    table.ForeignKey(
                        name: "f_k_payments__users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "comment_likes",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    comment_id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    user_id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_comment_likes", x => x.id);
                    table.ForeignKey(
                        name: "f_k_comment_likes__users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "f_k_comment_likes_comments_comment_id",
                        column: x => x.comment_id,
                        principalTable: "comments",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "project_log_entries",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    project_id = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    content = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    created_at = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("p_k_project_log_entries", x => x.id);
                    table.ForeignKey(
                        name: "f_k_project_log_entries_portfolio_projects_project_id",
                        column: x => x.project_id,
                        principalTable: "portfolio_projects",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "i_x_admin_refresh_tokens_admin_id",
                table: "admin_refresh_tokens",
                column: "admin_id");

            migrationBuilder.CreateIndex(
                name: "IX_admin_refresh_tokens_token",
                table: "admin_refresh_tokens",
                column: "token",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_admins_email",
                table: "admins",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_admins_username",
                table: "admins",
                column: "username",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_appointments_portfolio_id_appointment_date_time_slot",
                table: "appointments",
                columns: new[] { "portfolio_id", "appointment_date", "time_slot" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "i_x_bug_reports_user_id",
                table: "bug_reports",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "i_x_comment_likes_user_id",
                table: "comment_likes",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_comment_likes_comment_id_user_id",
                table: "comment_likes",
                columns: new[] { "comment_id", "user_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "i_x_comments_parent_comment_id",
                table: "comments",
                column: "parent_comment_id");

            migrationBuilder.CreateIndex(
                name: "i_x_comments_portfolio_id",
                table: "comments",
                column: "portfolio_id");

            migrationBuilder.CreateIndex(
                name: "i_x_comments_user_id",
                table: "comments",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "i_x_cover_letters_user_id",
                table: "cover_letters",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_email_templates_template_key",
                table: "email_templates",
                column: "template_key",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_email_verification_otps_email",
                table: "email_verification_otps",
                column: "email");

            migrationBuilder.CreateIndex(
                name: "i_x_feedbacks_portfolio_id",
                table: "feedback",
                column: "portfolio_id");

            migrationBuilder.CreateIndex(
                name: "i_x_feedbacks_user_id",
                table: "feedback",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "i_x_login_audit_logs_user_id",
                table: "login_audit_logs",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "i_x_login_verification_tokens_user_id",
                table: "login_verification_tokens",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_login_verification_tokens_token_hash",
                table: "login_verification_tokens",
                column: "token_hash");

            migrationBuilder.CreateIndex(
                name: "i_x_notifications_user_id",
                table: "notifications",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "i_x_password_reset_tokens_user_id",
                table: "password_reset_tokens",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "i_x_payments_subscription_id",
                table: "payments",
                column: "subscription_id");

            migrationBuilder.CreateIndex(
                name: "i_x_payments_user_id",
                table: "payments",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "i_x_portfolio_books_portfolio_id",
                table: "portfolio_books",
                column: "portfolio_id");

            migrationBuilder.CreateIndex(
                name: "i_x_portfolio_contact_messages_portfolio_id",
                table: "portfolio_contact_messages",
                column: "portfolio_id");

            migrationBuilder.CreateIndex(
                name: "i_x_portfolio_educations_portfolio_id",
                table: "portfolio_education",
                column: "portfolio_id");

            migrationBuilder.CreateIndex(
                name: "i_x_portfolio_experiences_portfolio_id",
                table: "portfolio_experience",
                column: "portfolio_id");

            migrationBuilder.CreateIndex(
                name: "i_x_portfolio_gallery_photos_portfolio_id",
                table: "portfolio_gallery_photos",
                column: "portfolio_id");

            migrationBuilder.CreateIndex(
                name: "i_x_portfolio_likes_user_id",
                table: "portfolio_likes",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_portfolio_likes_portfolio_id_user_id",
                table: "portfolio_likes",
                columns: new[] { "portfolio_id", "user_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "i_x_portfolio_projects_portfolio_id",
                table: "portfolio_projects",
                column: "portfolio_id");

            migrationBuilder.CreateIndex(
                name: "i_x_portfolio_skills_portfolio_id",
                table: "portfolio_skills",
                column: "portfolio_id");

            migrationBuilder.CreateIndex(
                name: "IX_portfolio_templates_code",
                table: "portfolio_templates",
                column: "code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "i_x_portfolio_views_portfolio_id",
                table: "portfolio_views",
                column: "portfolio_id");

            migrationBuilder.CreateIndex(
                name: "i_x_portfolios_template_id",
                table: "portfolios",
                column: "template_id");

            migrationBuilder.CreateIndex(
                name: "i_x_portfolios_user_id",
                table: "portfolios",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_portfolios_slug",
                table: "portfolios",
                column: "slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "i_x_project_log_entries_project_id",
                table: "project_log_entries",
                column: "project_id");

            migrationBuilder.CreateIndex(
                name: "i_x_refresh_tokens_user_id",
                table: "refresh_tokens",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_refresh_tokens_token",
                table: "refresh_tokens",
                column: "token",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "i_x_resume_educations_resume_id",
                table: "resume_educations",
                column: "resume_id");

            migrationBuilder.CreateIndex(
                name: "i_x_resume_experiences_resume_id",
                table: "resume_experiences",
                column: "resume_id");

            migrationBuilder.CreateIndex(
                name: "i_x_resume_skill_categories_resume_id",
                table: "resume_skill_categories",
                column: "resume_id");

            migrationBuilder.CreateIndex(
                name: "i_x_resumes_user_id",
                table: "resumes",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "i_x_site_settings_default_template_id",
                table: "site_settings",
                column: "default_template_id");

            migrationBuilder.CreateIndex(
                name: "IX_subscription_plans_tier",
                table: "subscription_plans",
                column: "tier",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_trusted_devices_user_id_device_id",
                table: "trusted_devices",
                columns: new[] { "user_id", "device_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "i_x_user_complaints_user_id",
                table: "user_complaints",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_user_follows_followee_id",
                table: "user_follows",
                column: "followee_id");

            migrationBuilder.CreateIndex(
                name: "IX_user_follows_follower_id_followee_id",
                table: "user_follows",
                columns: new[] { "follower_id", "followee_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "i_x_user_settings_default_template_id",
                table: "user_settings",
                column: "default_template_id");

            migrationBuilder.CreateIndex(
                name: "i_x_user_subscriptions_plan_id",
                table: "user_subscriptions",
                column: "plan_id");

            migrationBuilder.CreateIndex(
                name: "i_x_user_subscriptions_user_id",
                table: "user_subscriptions",
                column: "user_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_users_email",
                table: "users",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_users_username",
                table: "users",
                column: "username",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "admin_refresh_tokens");

            migrationBuilder.DropTable(
                name: "appointments");

            migrationBuilder.DropTable(
                name: "bug_reports");

            migrationBuilder.DropTable(
                name: "comment_likes");

            migrationBuilder.DropTable(
                name: "cover_letters");

            migrationBuilder.DropTable(
                name: "email_templates");

            migrationBuilder.DropTable(
                name: "email_verification_otps");

            migrationBuilder.DropTable(
                name: "error_logs");

            migrationBuilder.DropTable(
                name: "feedback");

            migrationBuilder.DropTable(
                name: "login_audit_logs");

            migrationBuilder.DropTable(
                name: "login_verification_tokens");

            migrationBuilder.DropTable(
                name: "notifications");

            migrationBuilder.DropTable(
                name: "password_reset_tokens");

            migrationBuilder.DropTable(
                name: "payments");

            migrationBuilder.DropTable(
                name: "portfolio_books");

            migrationBuilder.DropTable(
                name: "portfolio_contact_messages");

            migrationBuilder.DropTable(
                name: "portfolio_education");

            migrationBuilder.DropTable(
                name: "portfolio_experience");

            migrationBuilder.DropTable(
                name: "portfolio_gallery_photos");

            migrationBuilder.DropTable(
                name: "portfolio_likes");

            migrationBuilder.DropTable(
                name: "portfolio_skills");

            migrationBuilder.DropTable(
                name: "portfolio_views");

            migrationBuilder.DropTable(
                name: "project_log_entries");

            migrationBuilder.DropTable(
                name: "refresh_tokens");

            migrationBuilder.DropTable(
                name: "resume_educations");

            migrationBuilder.DropTable(
                name: "resume_experiences");

            migrationBuilder.DropTable(
                name: "resume_skill_categories");

            migrationBuilder.DropTable(
                name: "site_settings");

            migrationBuilder.DropTable(
                name: "trusted_devices");

            migrationBuilder.DropTable(
                name: "user_complaints");

            migrationBuilder.DropTable(
                name: "user_follows");

            migrationBuilder.DropTable(
                name: "user_settings");

            migrationBuilder.DropTable(
                name: "admins");

            migrationBuilder.DropTable(
                name: "comments");

            migrationBuilder.DropTable(
                name: "user_subscriptions");

            migrationBuilder.DropTable(
                name: "portfolio_projects");

            migrationBuilder.DropTable(
                name: "resumes");

            migrationBuilder.DropTable(
                name: "subscription_plans");

            migrationBuilder.DropTable(
                name: "portfolios");

            migrationBuilder.DropTable(
                name: "portfolio_templates");

            migrationBuilder.DropTable(
                name: "users");
        }
    }
}
