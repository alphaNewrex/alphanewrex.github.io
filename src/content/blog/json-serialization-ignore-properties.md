---
title: "Working with System.Text.Json: How to Ignore Properties During Serialization"
description: "Learn how to selectively ignore properties when serializing objects with System.Text.Json in .NET for cleaner and more efficient JSON output."
pubDate: "Mar 20 2025"
heroImage: "/blog/json-serialization.webp"
badge: ".NET"
tags: ["dotnet", "json", "serialization", "csharp"]
draft: false
---

# Working with System.Text.Json: How to Ignore Properties During Serialization

If you've worked with JSON in .NET applications, you know that controlling what gets serialized can be crucial for both performance and security. Ever found yourself in a situation where you needed to exclude certain properties from your JSON output? Let's dig into how we can achieve this with System.Text.Json in .NET.

## The Problem with Default Serialization

When you serialize an object to JSON, by default, System.Text.Json will include all public properties. But sometimes this isn't what we want:

- You might have sensitive data you don't want to expose
- Some properties might be redundant or only used internally
- You could be dealing with circular references that cause serialization issues
- Maybe you just need to reduce payload size for performance

Let's look at a simple example:

```csharp
public class User
{
    public string Username { get; set; }
    public string Email { get; set; }
    public string Password { get; set; }  // We definitely don't want to serialize this!
    public DateTime LastLoginTime { get; set; }
    public List<LoginAttempt> LoginHistory { get; set; }
}
```

If we serialize this User object without any configuration, that Password property is going to show up in our JSON - not great!

## Solution 1: [JsonIgnore] Attribute

The simplest way to exclude a property is to use the `[JsonIgnore]` attribute from the `System.Text.Json.Serialization` namespace:

```csharp
public class User
{
    public string Username { get; set; }
    public string Email { get; set; }
    
    [JsonIgnore]
    public string Password { get; set; }
    
    public DateTime LastLoginTime { get; set; }
    public List<LoginAttempt> LoginHistory { get; set; }
}
```

Now when you serialize this class:

```csharp
var user = new User
{
    Username = "johndoe",
    Email = "john@example.com",
    Password = "supersecret123",
    LastLoginTime = DateTime.Now
};

string json = JsonSerializer.Serialize(user);
Console.WriteLine(json);
```

The output will exclude the Password property:

```json
{
  "Username": "johndoe",
  "Email": "john@example.com",
  "LastLoginTime": "2023-07-14T14:30:00",
  "LoginHistory": null
}
```

## Solution 2: Conditional Property Ignoring

What if you want to ignore properties conditionally? For instance, maybe you want to include the LastLoginTime only for admin users. The `[JsonIgnore]` attribute is all-or-nothing, but you can use a custom converter:

```csharp
public class UserConverter : JsonConverter<User>
{
    private readonly bool _isAdminView;

    public UserConverter(bool isAdminView)
    {
        _isAdminView = isAdminView;
    }

    public override User Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        // Deserialization logic here
        throw new NotImplementedException();
    }

    public override void Write(Utf8JsonWriter writer, User user, JsonSerializerOptions options)
    {
        writer.WriteStartObject();
        
        writer.WriteString("Username", user.Username);
        writer.WriteString("Email", user.Email);
        
        // Only include LastLoginTime for admin view
        if (_isAdminView)
        {
            writer.WriteString("LastLoginTime", user.LastLoginTime.ToString("o"));
        }
        
        // Never include password
        
        writer.WriteEndObject();
    }
}
```

Then use it like this:

```csharp
var options = new JsonSerializerOptions();
options.Converters.Add(new UserConverter(isAdminView: false));
string regularUserJson = JsonSerializer.Serialize(user, options);

options = new JsonSerializerOptions();
options.Converters.Add(new UserConverter(isAdminView: true));
string adminUserJson = JsonSerializer.Serialize(user, options);
```

## Solution 3: Using JsonSerializerOptions

If you need more dynamic control without creating custom converters, you can use the `DefaultIgnoreCondition` property:

```csharp
var options = new JsonSerializerOptions
{
    DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
};

string json = JsonSerializer.Serialize(user, options);
```

This will ignore all null properties during serialization.

## Solution 4: Source Generation Approach

In .NET 6 and later, you can use source generators for more efficient serialization with controlled property ignoring:

```csharp
[JsonSourceGenerationOptions(
    PropertyNamingPolicy = JsonKnownNamingPolicy.CamelCase,
    DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull)]
[JsonSerializable(typeof(User))]
public partial class MyJsonContext : JsonSerializerContext
{
}
```

Then serialize with:

```csharp
string json = JsonSerializer.Serialize(user, MyJsonContext.Default.User);
```

## Why This Matters: A Real-World Scenario

In a recent project, I was building an API that returned user profiles. Originally, I was returning everything - including some internal tracking properties that consumers of the API didn't need. Not only was this inefficient, but it was also exposing implementation details unnecessarily.

By selectively ignoring properties, I managed to reduce the JSON payload size by nearly 40% and make the API responses cleaner and more focused.

## Conclusion

Being selective about what you serialize to JSON is an important part of building clean, efficient, and secure APIs. System.Text.Json gives you multiple ways to control this process, from simple attributes to custom converters.

What's your experience with JSON serialization in .NET? Have you run into any specific challenges with property ignoring? Let me know in the comments!

---

**Pro tip**: Remember that for complex objects, controlling serialization might require a combination of approaches. Don't be afraid to mix and match these techniques to get the exact JSON output you need.
