import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TypographyH1, TypographyP } from "@/components/ui/typography";

export default function TestPage() {
  return (
    <div className="container py-10 space-y-8">
      <TypographyH1>Test Page</TypographyH1>
      <TypographyP>This is a simple test page to verify the application is working correctly.</TypographyP>
      
      <Separator className="my-6" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Card Component</CardTitle>
            <CardDescription>Testing UI components</CardDescription>
          </CardHeader>
          <CardContent>
            <TypographyP>This card uses the Card component from shadcn/ui.</TypographyP>
          </CardContent>
          <CardFooter>
            <Button>Test Button</Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Typography Testing</CardTitle>
            <CardDescription>Verifying typography components</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <TypographyH1 className="text-xl">Heading 1</TypographyH1>
            <TypographyP>Paragraph text for testing typography.</TypographyP>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">Cancel</Button>
            <Button>Submit</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 