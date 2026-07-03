import SwiftUI

struct AuthView: View {
    private enum Mode {
        case login, signup

        var title: String { self == .login ? "Welcome back." : "Join PawWalk." }
        var cta: String { self == .login ? "Log in" : "Sign up" }
        var toggleHint: String { self == .login ? "New here?" : "Already have an account?" }
        var toggleAction: String { self == .login ? "Sign up" : "Log in" }
    }

    @Environment(AuthSession.self) private var auth

    @State private var mode: Mode = .login
    @State private var email = ""
    @State private var password = ""
    @State private var name = ""
    @State private var role: UserRole = .owner
    @State private var isSubmitting = false
    @State private var validationMessage: String?

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                VStack(alignment: .leading, spacing: 4) {
                    Text(mode.title).font(.dm(24, .semibold)).foregroundStyle(Brand.ink)
                }
                .frame(maxWidth: .infinity, alignment: .leading)

                fields

                if let message = validationMessage ?? auth.errorMessage {
                    Text(message).font(.dm(12)).foregroundStyle(.red)
                        .frame(maxWidth: .infinity, alignment: .leading)
                }

                submitButton

                Button {
                    mode = mode == .login ? .signup : .login
                } label: {
                    Text("\(mode.toggleHint) \(mode.toggleAction)")
                        .font(.dm(13))
                        .foregroundStyle(Brand.accent)
                }
            }
            .padding(20)
        }
        .background(Brand.canvas.ignoresSafeArea())
    }

    private var fields: some View {
        VStack(spacing: 12) {
            if mode == .signup {
                roleToggle
                AuthField(label: "Name", text: $name, textContentType: .name)
            }
            AuthField(label: "Email", text: $email, keyboard: .emailAddress, textContentType: .emailAddress)
            AuthField(label: "Password", text: $password, isSecure: true,
                      textContentType: mode == .login ? .password : .newPassword)
        }
    }

    private var roleToggle: some View {
        VStack(alignment: .leading, spacing: 6) {
            MonoCaption("I am a", size: 9, tracking: 0.1)
            HStack(spacing: 8) {
                rolePill(.owner, "Pet owner")
                rolePill(.walker, "Dog walker")
            }
        }
    }

    private func rolePill(_ pillRole: UserRole, _ label: String) -> some View {
        Button {
            role = pillRole
        } label: {
            Text(label)
                .font(.dm(13, .medium))
                .foregroundStyle(role == pillRole ? Brand.onInverse : Brand.ink)
                .padding(.horizontal, 14).frame(height: 36)
                .background(role == pillRole ? Brand.accent : Brand.surfaceDeep)
                .clipShape(Capsule())
        }
    }

    private var submitButton: some View {
        Button(action: submit) {
            HStack {
                Spacer()
                if isSubmitting {
                    ProgressView().tint(Brand.onInverse)
                } else {
                    Text(mode.cta).font(.dm(14, .semibold))
                }
                Spacer()
            }
            .frame(height: 46)
            .background(Brand.accent)
            .foregroundStyle(Brand.onInverse)
            .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
        }
        .disabled(isSubmitting)
    }

    private func validate() -> String? {
        guard email.contains("@"), email.contains(".") else { return "Enter a valid email." }
        guard password.count >= 8 else { return "Password must be at least 8 characters." }
        if mode == .signup, name.trimmingCharacters(in: .whitespaces).isEmpty {
            return "Tell us your name."
        }
        return nil
    }

    private func submit() {
        guard let message = validate() else {
            validationMessage = nil
            Task {
                isSubmitting = true
                defer { isSubmitting = false }
                if mode == .login {
                    await auth.logIn(email: email, password: password)
                } else {
                    await auth.signUp(email: email, password: password, name: name, role: role)
                }
            }
            return
        }
        validationMessage = message
    }
}

/// Trimmed styled input: a Brand-styled label over a TextField (or a
/// SecureField when `isSecure`, which shows dots instead of characters).
private struct AuthField: View {
    let label: String
    @Binding var text: String
    var isSecure: Bool = false
    var keyboard: UIKeyboardType = .default
    var textContentType: UITextContentType?

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            MonoCaption(label, size: 9, tracking: 0.1)
            Group {
                if isSecure {
                    SecureField("", text: $text)
                } else {
                    TextField("", text: $text)
                        .keyboardType(keyboard)
                        .autocorrectionDisabled()
                        .textInputAutocapitalization(.never)
                }
            }
            .font(.dm(15))
            .textContentType(textContentType)
            Rectangle().fill(Brand.ink.opacity(0.18)).frame(height: 1)
        }
    }
}

#Preview {
    AuthView()
        .environment(AuthSession())
}
